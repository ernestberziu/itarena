"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  language: string;
}

export function PortalSettingsForm({
  user,
  locale,
}: {
  user: User;
  locale: string;
}) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [language, setLanguage] = useState(user.language);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/portal/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, language }),
      });
      if (!res.ok) throw new Error();
      toast.success(locale === "sq" ? "Cilësimet u ruajtën!" : "Settings saved!");
      router.refresh();
    } catch {
      toast.error(locale === "sq" ? "Gabim gjatë ruajtjes" : "Failed to save settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-sm font-semibold">
            {locale === "sq" ? "Informacioni Personal" : "Personal Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">
                  {locale === "sq" ? "Emri" : "First Name"}
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">
                  {locale === "sq" ? "Mbiemri" : "Last Name"}
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted/40"
              />
              <p className="text-xs text-muted-foreground">
                {locale === "sq" ? "Emaili nuk mund të ndryshohet." : "Email cannot be changed."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                {locale === "sq" ? "Telefon" : "Phone"}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+355..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                {locale === "sq" ? "Gjuha e Preferuar" : "Preferred Language"}
              </Label>
              <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
                <SelectTrigger>
                  <SelectValue>
                    {language === "sq" ? "🇦🇱 Shqip" : "🇬🇧 English"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sq">🇦🇱 Shqip</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" size="sm" className="gap-2" disabled={loading}>
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {locale === "sq" ? "Ruaj Ndryshimet" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
