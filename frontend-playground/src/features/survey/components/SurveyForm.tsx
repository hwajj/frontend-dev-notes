import React from "react";

//오직 UI만 담당. 상태·비즈니스 로직 없음
export function SurveyForm({ draft, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        value={draft?.answer || ""}
        onChange={(e) => onChange({ answer: e.target.value })}
      />
      <button type="submit">제출</button>
    </form>
  );
}
