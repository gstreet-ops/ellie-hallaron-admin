import { useData } from '../contexts/DataContext';

export default function Toast() {
  const { toast } = useData();
  if (!toast) return null;

  return (
    <div className={`toast toast-${toast.type}`}>
      {toast.message}
    </div>
  );
}
