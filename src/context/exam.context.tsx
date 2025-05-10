import React, { createContext, useContext, useReducer } from "react";

export interface QuestionOption {
  _id: string;
  optionText: string;
}

export interface Statement {
  statementNumber: number;
  statementText: string;
}

export interface Question {
  id: string;
  questionText: string;
  type: "MCQ" | "STATEMENT_BASED";
  options: QuestionOption[];
  statements?: Statement[];
  statementInstruction?: string;
  marks: number;
  selectedOption: string | null;
  responseTime: number;
}

export interface ExamDetails {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passMarkPercentage: number;
  hasNegativeMarking: boolean;
  negativeMarkingValue: number;
  allowNavigation: boolean;
}

interface ExamState {
  attemptId: string | null;
  timeRemaining: number; // in seconds
  currentQuestionIndex: number;
  questions: Question[];
  examDetails: ExamDetails | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  status: "idle" | "in-progress" | "completed" | "timed-out";
}

type ExamAction =
  | {
      type: "START_EXAM";
      payload: { attemptId: string; timeRemaining: number };
    }
  | { type: "SET_EXAM_DETAILS"; payload: ExamDetails }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "SET_CURRENT_QUESTION"; payload: number }
  | {
      type: "SAVE_ANSWER";
      payload: { questionId: string; selectedOption: string | null };
    }
  | { type: "UPDATE_TIME"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "SET_SUBMITTING"; payload: boolean }
  | { type: "SET_STATUS"; payload: ExamState["status"] }
  | { type: "CLEANUP" };

const initialState: ExamState = {
  attemptId: null,
  timeRemaining: 0,
  currentQuestionIndex: 0,
  questions: [],
  examDetails: null,
  loading: false,
  error: null,
  submitting: false,
  status: "idle",
};

function examReducer(state: ExamState, action: ExamAction): ExamState {
  switch (action.type) {
    case "START_EXAM":
      return {
        ...state,
        attemptId: action.payload.attemptId,
        timeRemaining: action.payload.timeRemaining,
        status: "in-progress",
      };
    case "SET_EXAM_DETAILS":
      return {
        ...state,
        examDetails: action.payload,
      };
    case "SET_QUESTIONS":
      return {
        ...state,
        questions: action.payload,
      };
    case "SET_CURRENT_QUESTION":
      return {
        ...state,
        currentQuestionIndex: action.payload,
      };
    case "SAVE_ANSWER":
      return {
        ...state,
        questions: state.questions.map((q) =>
          q.id === action.payload.questionId
            ? { ...q, selectedOption: action.payload.selectedOption }
            : q
        ),
      };
    case "UPDATE_TIME":
      return {
        ...state,
        timeRemaining: action.payload,
        status: action.payload <= 0 ? "timed-out" : state.status,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "SET_SUBMITTING":
      return {
        ...state,
        submitting: action.payload,
      };
    case "SET_STATUS":
      return {
        ...state,
        status: action.payload,
      };
    case "CLEANUP":
      // Only reset certain parts of the state that could cause problems
      return {
        ...state,
        submitting: false,
        error: null,
      };
    default:
      return state;
  }
}

interface ExamContextType {
  state: ExamState;
  dispatch: React.Dispatch<ExamAction>;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(examReducer, initialState);

  return (
    <ExamContext.Provider value={{ state, dispatch }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
};
