export default function Spinner() {
  return (
    <div className="fixed inset-0 grid place-items-center bg-white/60">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-black/20 border-t-black" />
    </div>
  );
}
