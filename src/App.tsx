import { useState } from "react";
import Tabs from "./components/Tabs";
import TabsWithReducer from "./components/TabsWithReducer";

function App() {
  const [view, setView] = useState<"simple" | "complex">("simple");

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0 }}>탭 전환 기능 테스트</h1>
        <div>
          <button
            onClick={() => setView("simple")}
            style={{
              padding: "8px 16px",
              marginRight: "8px",
              fontWeight: view === "simple" ? "bold" : "normal",
              backgroundColor: view === "simple" ? "#007acc" : "#f0f0f0",
              color: view === "simple" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            useState 버전 (간단)
          </button>
          <button
            onClick={() => setView("complex")}
            style={{
              padding: "8px 16px",
              fontWeight: view === "complex" ? "bold" : "normal",
              backgroundColor: view === "complex" ? "#007acc" : "#f0f0f0",
              color: view === "complex" ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            useReducer 버전 (복잡)
          </button>
        </div>
      </div>

      {view === "simple" ? (
        <div>
          <h2>useState 버전 - 간단한 탭 전환</h2>
          <Tabs />
        </div>
      ) : (
        <div>
          <h2>useReducer 버전 - 복잡한 상태 관리</h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            탭 추가/삭제, 히스토리 관리, 로딩/에러 상태, 데이터 페칭 등 복잡한
            상태를 useReducer로 관리
          </p>
          <TabsWithReducer />
        </div>
      )}
    </div>
  );
}

export default App;
