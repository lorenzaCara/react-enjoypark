import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Bell, Shield, Palette, Globe, User, HelpCircle, FileText, LogOut, ChevronRight, Moon, Sun, Smartphone, Mail, MessageSquare, Lock, Eye, Database, Heart, Star, Coffee, AlertTriangle, Info, Settings, ArrowLeft, } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useUser } from "@/contexts/UserProvider";
import { useTheme } from "@/contexts/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import gsap from "gsap";

export default function SettingsPage() {
  const { user, handleLogout, togglePushNotifications } = useUser();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const headerRef = useRef(null);
  const [isFixed, setIsFixed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    pushNotifications: null,
    emailNotifications: true,
    smsNotifications: false,
    attractionReminders: true,
    showReminders: true,
    plannerUpdates: true,
    promotionalEmails: false,

    profileVisibility: "public",
    dataSharing: false,
    analyticsTracking: true,
    locationServices: true,

    language: "it",
    autoSave: true,
    offlineMode: false,
  });

  useEffect(() => {
    if (user && user.allowNotifications !== undefined && user.allowNotifications !== null) {
      setSettings(prev => ({
        ...prev,
        pushNotifications: user.allowNotifications,
      }));
    }
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 50 && !isFixed) {
        setIsFixed(true);
        gsap.fromTo(
          headerRef.current,
          {
            y: -50,
            paddingTop: getPaddingPx(false),
            paddingBottom: getPaddingPx(false),
          },
          {
            y: 0,
            paddingTop: 32,
            paddingBottom: 32,
            duration: 0.5,
            ease: "power2.out",
          }
        );
      } else if (scrollY <= 50 && isFixed) {
        setIsFixed(false);
        gsap.to(headerRef.current, {
          y: 0,
          paddingTop: getPaddingPx(false),
          paddingBottom: getPaddingPx(false),
          duration: 0.5,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFixed]);

  function getPaddingPx(isFixed) {
    if (isFixed) {
      return 32;
    } else {
      if (window.innerWidth >= 1024) {
        return 128;
      } else {
        return 80;
      }
    }
  }

  const handleSettingChange = async (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  
    try {
      if (key === "pushNotifications") {
        const result = await togglePushNotifications(value);
        if (!result.success) throw new Error(result.message);
      }
  
      toast({
        title: "Setting updated",
        description: "Your preferences have been saved.",
        className: "bg-white text-gray-900 border border-gray-200 shadow-md"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Unable to save the setting.",
        variant: "destructive",
      });

      setSettings(prev => ({
        ...prev,
        [key]: !value,
      }));
    }
  };  
  

  const handleThemeChange = (isDark) => {
    const newTheme = isDark ? "dark" : "light";
    setTheme(newTheme);
  
    toast({
      title: "Theme updated",
      description: `${isDark ? "Dark" : "Light"} theme activated.`,
      className: "bg-white text-gray-900 border border-gray-200 shadow-md"
    });
  };
  
  const handleLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center bg-gradient-to-r from-teal-500/10 to-purple-500/10 p-8 rounded-3xl border border-teal-500/20 backdrop-blur-sm max-w-md">
          <AlertTriangle className="h-16 w-16 text-teal-500 mx-auto mb-4" />
          <h2 className="text-xl text-gray-800 dark:text-gray-200 mb-2">
            Required access
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You must be logged in to access the settings.
          </p>
          <Link to="/login">
            <Button
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full"
            >
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-700 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 pb-8">
      <div className={`mx-auto py-4 ${isFixed ? "pt-24" : ""}`}>
        <div
          ref={headerRef}
          className={`${
            isFixed
              ? "fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600"
              : "relative"
          } text-white transition-all duration-700 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-600 ${
            isFixed ? "py-8 rounded-b-3xl" : "py-12 lg:py-20 rounded-3xl lg:mx-4"
          }`}
        >
          <div className="absolute left-6 top-6">
            <Link to="/profile">
              <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl border border-white/20 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 ">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1
              className={`transition-all duration-700 font-light tracking-wider ${
                isFixed
                  ? "lg:text-2xl md:text-xl text-lg px-4"
                  : "lg:text-5xl md:text-4xl text-3xl"
              }`}
            >
              Settings
            </h1>
            {!isFixed && (
              <p className="text-gray-100 text-lg transition-opacity duration-700 pt-4">
                Manage your profile and personal information.
              </p>
            )}
          </div>
          </div>
      </div>

      <div className="space-y-6 mt-8 lg:mx-4">
        {/* Account Section */}
        <Card className="rounded-3xl border-2 border-white dark:border-gray-700 dark:bg-gray-800 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-teal-700 dark:text-teal-400" />
              </div>
              <div>
                <CardTitle className="text-lg font-normal dark:text-gray-100">
                  Account
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Manage your profile and personal information.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/profile-settings">
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
              >
                <div className="flex items-center font-normal">
                  <User className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Edit your profile</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Button>
            </Link>
            <Link to={"/profile-settings"}>
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
              >
                <div className="flex items-center font-normal">
                  <Lock className="w-5 h-5 mr-3 text-gray-400" />
                  <span>Password and security</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="rounded-3xl border-2 border-white dark:border-gray-700 dark:bg-gray-800 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-400 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-cyan-700 dark:text-cyan-400" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100 font-normal">
                  Notifications
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Customize how you receive notifications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <span className="text-sm dark:text-gray-200 font-normal">
                    Push Notifications
                  </span>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications on your device
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Email
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Email notifications
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("emailNotifications", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    SMS
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    SMS notifications
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) =>
                  handleSettingChange("smsNotifications", checked)
                }
              />
            </div>

            <hr className="border-gray-200 dark:border-gray-600" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Attraction Reminders
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Alerts for planned attractions
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.attractionReminders}
                onCheckedChange={(checked) =>
                  handleSettingChange("attractionReminders", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coffee className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Show Reminders
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Alerts for planned shows
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.showReminders}
                onCheckedChange={(checked) =>
                  handleSettingChange("showReminders", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Promotional Emails
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Special offers and promotions
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.promotionalEmails}
                onCheckedChange={(checked) =>
                  handleSettingChange("promotionalEmails", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="rounded-3xl border-2 border-white dark:border-gray-700 dark:bg-gray-800 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-50 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-teal-700 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100 font-normal">
                  Privacy and Security
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Control your privacy and shared data
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Profile Visibility
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Who can see your profile
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
              >
                Private
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Data Sharing
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Share data to improve experience
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.dataSharing}
                onCheckedChange={(checked) =>
                  handleSettingChange("dataSharing", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Location Services
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Use location for advanced features
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.locationServices}
                onCheckedChange={(checked) =>
                  handleSettingChange("locationServices", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences Section */}
        <Card className="rounded-3xl border-2 border-white dark:border-gray-700 dark:bg-gray-800 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-50 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Palette className="w-6 h-6 text-cyan-700 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100 font-normal">
                  App Preferences
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Customize app appearance and behavior
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 ms-3 text-gray-400" />
                ) : (
                  <Sun className="w-4 h-4 ms-3 text-gray-400" />
                )}
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Dark Theme
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Activate the app's dark theme
                  </div>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">Language</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Interface language
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
              >
                English
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 ms-3 text-gray-400" />
                <div>
                  <div className="text-sm dark:text-gray-200 font-normal">
                    Auto-save
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically save planners
                  </div>
                </div>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={(checked) =>
                  handleSettingChange("autoSave", checked)
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="rounded-3xl border-2 border-white dark:border-gray-700 dark:bg-gray-800 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-teal-50 dark:bg-green-900 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-teal-700 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100 font-normal">
                  Support
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Help and app information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="">
            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
            >
              <div className="flex items-center font-normal">
                <HelpCircle className="w-4 h-4 mr-3 text-gray-400" />
                <span>Help Center</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>

            <Link to="/contact">
              <Button
                variant="ghost"
                className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
              >
                <div className="flex items-center font-normal">
                  <MessageSquare className="w-4 h-4 mr-3 text-gray-400" />
                  <span>Contact Us</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
            >
              <div className="flex items-center font-normal">
                <Star className="w-4 h-4 mr-3 text-gray-400" />
                <span>Rate the App</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>
          </CardContent>
        </Card>

        {/* Legal Section */}
        <Card className="rounded-3xl border-2 border-white dark:border-gray-700 dark:bg-gray-800 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <CardTitle className="text-lg dark:text-gray-100 font-normal">
                  Legal Information
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Terms, privacy, and legal information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
            >
              <div className="flex items-center font-normal">
                <FileText className="w-4 h-4 mr-3 text-gray-400" />
                <span>Terms of Service</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
            >
              <div className="flex items-center font-normal">
                <Shield className="w-4 h-4 mr-3 text-gray-400" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-between h-12 rounded-2xl dark:hover:bg-gray-700"
            >
              <div className="flex items-center font-normal">
                <Info className="w-4 h-4 mr-3 text-gray-400" />
                <span>App Information</span>
              </div>
              <Badge
                variant="outline"
                className="bg-gray-50 dark:bg-gray-700 dark:text-gray-300 ml-auto mr-2"
              >
                v1.0.0
              </Badge>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="rounded-3xl border-2 border-red-50 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-none">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 rounded-2xl text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
              onClick={handleLogoutClick}
            >
              <LogOut className="w-4 h-4 mr-3" />
              <span>Logout</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
