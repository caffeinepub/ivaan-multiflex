import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { useSaveProfile, useUserProfile } from "../hooks/useBackend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function ProfilePage() {
  const { identity, login, clear } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const principal = identity?.getPrincipal().toText();
  const { data: profile } = useUserProfile();
  const saveProfile = useSaveProfile();
  const [name, setName] = useState("");
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setIsSeller(profile.isSeller);
    }
  }, [profile]);

  if (!isAuthenticated)
    return (
      <div
        className="max-w-md mx-auto px-4 py-20 text-center"
        data-ocid="profile.page"
      >
        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Login to your account</h2>
        <p className="text-muted-foreground mb-6">
          View your profile and manage your account.
        </p>
        <Button
          className="bg-primary text-primary-foreground"
          onClick={login}
          data-ocid="profile.login_button"
        >
          Login with Internet Identity
        </Button>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto px-4 py-12" data-ocid="profile.page">
      <h1 className="text-3xl font-display font-bold mb-8">My Profile</h1>
      <div className="bg-card border border-border rounded-2xl p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{profile?.name || "New User"}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {principal?.slice(0, 20)}...
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="mb-1" htmlFor="profile-name">
              Display Name
            </Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              data-ocid="profile.name_input"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="seller-switch"
              checked={isSeller}
              onCheckedChange={setIsSeller}
              data-ocid="profile.seller_switch"
            />
            <Label htmlFor="seller-switch">I want to sell on IVAAN</Label>
          </div>
          <Button
            className="w-full bg-primary text-primary-foreground"
            data-ocid="profile.save_button"
            disabled={saveProfile.isPending}
            onClick={() => {
              saveProfile.mutate(
                { name, isSeller },
                {
                  onSuccess: () => toast.success("Profile saved!"),
                  onError: () => toast.error("Failed to save profile"),
                },
              );
            }}
          >
            Save Profile
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full"
          data-ocid="profile.logout_button"
          onClick={clear}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
