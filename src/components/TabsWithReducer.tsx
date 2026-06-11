import { useReducer } from "react";

// 탭별 데이터 타입
interface TabData {
  id: string;
  label: string;
  content: string;
  isLoading: boolean;
  error: string | null;
  data: any | null;
}

// 상태 타입
interface TabsState {
  tabs: TabData[];
  activeTabId: string;
  history: string[]; // 탭 전환 히스토리 (뒤로가기용)
  historyIndex: number; // 현재 히스토리 위치
}

// 액션 타입
type TabsAction =
  | { type: "SWITCH_TAB"; tabId: string }
  | { type: "ADD_TAB"; label: string; content: string }
  | { type: "REMOVE_TAB"; tabId: string }
  | { type: "SET_LOADING"; tabId: string; isLoading: boolean }
  | { type: "SET_ERROR"; tabId: string; error: string | null }
  | { type: "SET_DATA"; tabId: string; data: any }
  | { type: "GO_BACK" }
  | { type: "GO_FORWARD" };

// 초기 상태
const initialState: TabsState = {
  tabs: [
    {
      id: "home",
      label: "홈",
      content: "홈 화면",
      isLoading: false,
      error: null,
      data: null,
    },
    {
      id: "profile",
      label: "프로필",
      content: "프로필 화면",
      isLoading: false,
      error: null,
      data: null,
    },
    {
      id: "settings",
      label: "설정",
      content: "설정 화면",
      isLoading: false,
      error: null,
      data: null,
    },
  ],
  activeTabId: "home",
  history: ["home"],
  historyIndex: 0,
};

// Reducer 함수
function tabsReducer(state: TabsState, action: TabsAction): TabsState {
  switch (action.type) {
    case "SWITCH_TAB": {
      // 이미 같은 탭이면 변경 없음
      if (state.activeTabId === action.tabId) return state;

      // 히스토리 업데이트 (현재 위치 이후는 제거하고 새 탭 추가)
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(action.tabId);

      return {
        ...state,
        activeTabId: action.tabId,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }

    case "ADD_TAB": {
      const newTab: TabData = {
        id: `tab-${Date.now()}`,
        label: action.label,
        content: action.content,
        isLoading: false,
        error: null,
        data: null,
      };

      return {
        ...state,
        tabs: [...state.tabs, newTab],
        activeTabId: newTab.id,
        history: [...state.history, newTab.id],
        historyIndex: state.historyIndex + 1,
      };
    }

    case "REMOVE_TAB": {
      // 활성 탭을 삭제하면 다른 탭으로 전환
      const remainingTabs = state.tabs.filter((tab) => tab.id !== action.tabId);
      if (remainingTabs.length === 0) return state; // 마지막 탭은 삭제 불가

      let newActiveTabId = state.activeTabId;
      if (state.activeTabId === action.tabId) {
        // 삭제된 탭이 활성 탭이면 이전 탭으로 이동
        const currentIndex = state.tabs.findIndex((t) => t.id === action.tabId);
        const prevTab =
          state.tabs[currentIndex - 1] || state.tabs[currentIndex + 1];

        // 이전 탭이 없으면 상태 변경 없음
        //TS 입장에서는
        // prevTab이 undefined일 수도 있다고 생각하기 때문에
        // prevTab.id에 타입 에러가 날 수 있음.

        // 그래서 **아래처럼 가드(if (!prevTab) return state)**를 바로 앞에 넣어주면 안전해져
        if (!prevTab) return state;

        newActiveTabId = prevTab.id;
      }

      // 히스토리에서도 제거
      const newHistory = state.history.filter((id) => id !== action.tabId);

      return {
        ...state,
        tabs: remainingTabs,
        activeTabId: newActiveTabId,
        history: newHistory,
        historyIndex: Math.min(state.historyIndex, newHistory.length - 1),
      };
    }

    case "SET_LOADING": {
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId
            ? { ...tab, isLoading: action.isLoading }
            : tab
        ),
      };
    }

    case "SET_ERROR": {
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId ? { ...tab, error: action.error } : tab
        ),
      };
    }

    case "SET_DATA": {
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.id === action.tabId
            ? { ...tab, data: action.data, isLoading: false }
            : tab
        ),
      };
    }

    case "GO_BACK": {
      if (state.historyIndex <= 0) return state;
      const prevTabId = state.history[state.historyIndex - 1];
      return {
        ...state,
        activeTabId: prevTabId,
        historyIndex: state.historyIndex - 1,
      };
    }

    case "GO_FORWARD": {
      if (state.historyIndex >= state.history.length - 1) return state;
      const nextTabId = state.history[state.historyIndex + 1];
      return {
        ...state,
        activeTabId: nextTabId,
        historyIndex: state.historyIndex + 1,
      };
    }

    default:
      return state;
  }
}
// TabsState["tabs"] → TabData[]

// TabsState["tabs"][number] → TabData //TabData 배열의 모든 요소의 타입 = TabData

// TabsState["tabs"][number]["id"] → TabData["id"] → string

type TabId = TabsState["tabs"][number]["id"];
// 비동기 데이터 로딩 시뮬레이션
async function fetchTabData(
  tabId: TabId, //타입이 자동으로 "home" | "profile" | "settings" | "tab-123..." 이런 식으로 좁혀짐.
  dispatch: React.Dispatch<TabsAction>
) {
  dispatch({ type: "SET_LOADING", tabId, isLoading: true });
  dispatch({ type: "SET_ERROR", tabId, error: null });

  try {
    // API 호출 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 랜덤하게 에러 발생 (데모용)
    if (Math.random() < 0.2) {
      throw new Error("데이터 로딩 실패");
    }

    dispatch({
      type: "SET_DATA",
      tabId,
      data: { message: `${tabId} 데이터 로드 완료`, timestamp: Date.now() },
    });
  } catch (error) {
    dispatch({
      type: "SET_ERROR",
      tabId,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    });
    dispatch({ type: "SET_LOADING", tabId, isLoading: false });
  }
}

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  onClose?: () => void;
  canClose?: boolean;
}

function TabButton({
  label,
  isActive,
  onClick,
  onClose,
  canClose,
}: TabButtonProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "8px 16px",
        borderBottom: isActive ? "2px solid #007acc" : "2px solid transparent",
        cursor: "pointer",
        fontWeight: isActive ? "bold" : "normal",
        backgroundColor: isActive ? "#f0f0f0" : "transparent",
      }}
      onClick={onClick}
    >
      <span>{label}</span>
      {canClose && onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            marginLeft: 4,
            padding: "2px 6px",
            border: "none",
            background: "#ff4444",
            color: "white",
            borderRadius: "50%",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Smart Component: 복잡한 상태를 useReducer로 관리
export default function TabsWithReducer() {
  const [state, dispatch] = useReducer(tabsReducer, initialState);

  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId);

  // 탭 전환 시 데이터 로딩
  const handleSwitchTab = (tabId: string) => {
    dispatch({ type: "SWITCH_TAB", tabId });
    const tab = state.tabs.find((t) => t.id === tabId);
    if (tab && !tab.data && !tab.isLoading && !tab.error) {
      fetchTabData(tabId, dispatch);
    }
  };

  const handleAddTab = () => {
    const label = prompt("새 탭 이름을 입력하세요:");
    if (label) {
      dispatch({ type: "ADD_TAB", label, content: `${label} 내용` });
    }
  };

  const handleRemoveTab = (tabId: string) => {
    if (state.tabs.length <= 1) {
      alert("마지막 탭은 삭제할 수 없습니다.");
      return;
    }
    dispatch({ type: "REMOVE_TAB", tabId });
  };

  const handleRefresh = () => {
    if (activeTab) {
      fetchTabData(activeTab.id, dispatch);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          alignItems: "center",
        }}
      >
        <button onClick={handleAddTab} style={{ padding: "8px 16px" }}>
          + 탭 추가
        </button>
        <button
          onClick={() => dispatch({ type: "GO_BACK" })}
          disabled={state.historyIndex <= 0}
          style={{ padding: "8px 16px" }}
        >
          ← 뒤로
        </button>
        <button
          onClick={() => dispatch({ type: "GO_FORWARD" })}
          disabled={state.historyIndex >= state.history.length - 1}
          style={{ padding: "8px 16px" }}
        >
          앞으로 →
        </button>
        <button onClick={handleRefresh} style={{ padding: "8px 16px" }}>
          새로고침
        </button>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #ddd" }}>
        {state.tabs.map((tab) => (
          <TabButton
            key={tab.id}
            label={tab.label}
            isActive={tab.id === state.activeTabId}
            onClick={() => handleSwitchTab(tab.id)}
            onClose={() => handleRemoveTab(tab.id)}
            canClose={state.tabs.length > 1}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "1rem",
          border: "1px solid #ddd",
          minHeight: 200,
        }}
      >
        {activeTab && (
          <>
            <h3>{activeTab.label}</h3>
            <p>{activeTab.content}</p>

            {activeTab.isLoading && <div>로딩 중...</div>}
            {activeTab.error && (
              <div style={{ color: "red" }}>에러: {activeTab.error}</div>
            )}
            {activeTab.data && (
              <div style={{ marginTop: 8, padding: 8, background: "#f0f0f0" }}>
                <pre>{JSON.stringify(activeTab.data, null, 2)}</pre>
              </div>
            )}

            <div style={{ marginTop: 16, fontSize: "12px", color: "#666" }}>
              히스토리: {state.history.join(" → ")} (위치:{" "}
              {state.historyIndex + 1}/{state.history.length})
            </div>
          </>
        )}
      </div>
    </div>
  );
}
