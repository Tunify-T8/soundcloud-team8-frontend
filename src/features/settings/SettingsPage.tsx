import { useLocation } from "react-router-dom";
import SettingsLayout from "./components/SettingsLayout";
import AccountTab from "./tabs/AccountTab";
import AdvertisingTab from "./tabs/AdvertisingTab";
import ContentTab from "./tabs/ContentTab";
import NotificationsTab from "./tabs/NotificationsTab";
import PrivacyTab from "./tabs/PrivacyTab";
import SecurityTab from "./tabs/SecurityTab";

export default function SettingsPage() {
  const { pathname } = useLocation();

  const renderTab = () => {
    switch (pathname) {
      case "/settings/content":
        return <ContentTab />;
      case "/settings/notifications":
        return <NotificationsTab />;
      case "/settings/privacy":
        return <PrivacyTab />;
      case "/settings/advertising":
        return <AdvertisingTab />;
      case "/settings/security":
        return <SecurityTab />;
      case "/settings":
      default:
        return <AccountTab />;
    }
  };

  return <SettingsLayout>{renderTab()}</SettingsLayout>;
}
