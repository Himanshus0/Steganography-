import { createContext, useContext, useReducer, ReactNode } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────
export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface SenderState {
  message: string;
  coverImage: File | null;
  coverImagePreview: string | null;
  encodedImageUrl: string | null;
  status: Status;
  errorMessage: string | null;
}

export interface ReceiverState {
  encodedImage: File | null;
  encodedImagePreview: string | null;
  decodedMessage: string | null;
  status: Status;
  errorMessage: string | null;
}

interface AppState {
  sender: SenderState;
  receiver: ReceiverState;
}

type Action =
  | { type: 'SENDER_SET_MESSAGE'; payload: string }
  | { type: 'SENDER_SET_IMAGE'; payload: { file: File; preview: string } }
  | { type: 'SENDER_SET_STATUS'; payload: { status: Status; errorMessage?: string } }
  | { type: 'SENDER_SET_ENCODED'; payload: string }
  | { type: 'SENDER_RESET' }
  | { type: 'RECEIVER_SET_IMAGE'; payload: { file: File; preview: string } }
  | { type: 'RECEIVER_SET_STATUS'; payload: { status: Status; errorMessage?: string } }
  | { type: 'RECEIVER_SET_DECODED'; payload: string }
  | { type: 'RECEIVER_RESET' };

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState: AppState = {
  sender: {
    message: '',
    coverImage: null,
    coverImagePreview: null,
    encodedImageUrl: null,
    status: 'idle',
    errorMessage: null,
  },
  receiver: {
    encodedImage: null,
    encodedImagePreview: null,
    decodedMessage: null,
    status: 'idle',
    errorMessage: null,
  },
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SENDER_SET_MESSAGE':
      return { ...state, sender: { ...state.sender, message: action.payload } };
    case 'SENDER_SET_IMAGE':
      return {
        ...state,
        sender: {
          ...state.sender,
          coverImage: action.payload.file,
          coverImagePreview: action.payload.preview,
          encodedImageUrl: null,
          status: 'idle',
          errorMessage: null,
        },
      };
    case 'SENDER_SET_STATUS':
      return {
        ...state,
        sender: {
          ...state.sender,
          status: action.payload.status,
          errorMessage: action.payload.errorMessage ?? null,
        },
      };
    case 'SENDER_SET_ENCODED':
      return {
        ...state,
        sender: { ...state.sender, encodedImageUrl: action.payload, status: 'success' },
      };
    case 'SENDER_RESET':
      return { ...state, sender: initialState.sender };
    case 'RECEIVER_SET_IMAGE':
      return {
        ...state,
        receiver: {
          ...state.receiver,
          encodedImage: action.payload.file,
          encodedImagePreview: action.payload.preview,
          decodedMessage: null,
          status: 'idle',
          errorMessage: null,
        },
      };
    case 'RECEIVER_SET_STATUS':
      return {
        ...state,
        receiver: {
          ...state.receiver,
          status: action.payload.status,
          errorMessage: action.payload.errorMessage ?? null,
        },
      };
    case 'RECEIVER_SET_DECODED':
      return {
        ...state,
        receiver: { ...state.receiver, decodedMessage: action.payload, status: 'success' },
      };
    case 'RECEIVER_RESET':
      return { ...state, receiver: initialState.receiver };
    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
