export default function SettingsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      </div>
      <div
        className="flex flex-1 items-center justify-center rounded-lg"
      >
        <div className="flex flex-col items-center gap-4 text-center w-full">
          <p>Manage your account settings here.</p>
        </div>
      </div>
    </>
  );
}
