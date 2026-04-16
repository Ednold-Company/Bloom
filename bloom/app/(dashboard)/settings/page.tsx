import Card from "@/components/ui/Card";

export default function SettingsPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Notification preferences">
        <p className="text-sm text-[#5a2d4b]/70">
          Choose reminders for period start, fertility window, and symptom check-ins. Mobile notifications are
          configured in the Bloom Mobile app.
        </p>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          {[
            "Period start reminders",
            "Fertility window reminders",
            "Symptom logging reminders",
          ].map((label) => (
            <label key={label} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-[#ef7a9a]" />
              {label}
            </label>
          ))}
        </div>
      </Card>
      <Card title="Privacy">
        <p className="text-sm text-[#5a2d4b]/70">
          Bloom respects your data. You can use anonymous mode or delete your data anytime from your profile.
        </p>
      </Card>
    </div>
  );
}
