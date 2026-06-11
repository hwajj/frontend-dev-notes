import { useState } from "react";

interface TabButtonProps {
  label: string;
  value: string;
  isActive: boolean;
  onClick: () => void;
}

//Dumb: 그냥 UI만 렌더하는 컴포넌트
function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        fontWeight: isActive ? "bold" : "normal",
      }}
    >
      {label}
    </button>
  );
}

//탭의 상태 관리와 배치 담당
//Smart: 상태를 갖고 로직을 처리하는 컴포넌트
export default function Tabs() {
  const [activeTab, setActiveTab] = useState("home");

  const tabs = [
    { label: "홈", value: "home" },
    { label: "프로필", value: "profile" },
    { label: "설정", value: "settings" },
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        {tabs.map((t) => (
          <TabButton
            key={t.value}
            label={t.label}
            value={t.value}
            isActive={activeTab === t.value}
            onClick={() => setActiveTab(t.value)}
          />
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {activeTab === "home" && <div>홈 화면입니다</div>}
        {activeTab === "profile" && <div>프로필 화면입니다</div>}
        {activeTab === "settings" && <div>설정 화면입니다</div>}
      </div>
    </div>
  );
}
