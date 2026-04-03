import LogView from '../components/LogView';
import AliasesSection from '../components/sections/AliasesSection';
import AppSection from '../components/sections/AppSection';
import EmailSection from '../components/sections/EmailSection';
import InAppMessagesSection from '../components/sections/InAppMessagesSection';
import LiveActivitySection from '../components/sections/LiveActivitySection';
import LocationSection from '../components/sections/LocationSection';
import NotificationsSection from '../components/sections/NotificationsSection';
import OutcomesSection from '../components/sections/OutcomesSection';
import PushSection from '../components/sections/PushSection';
import SmsSection from '../components/sections/SmsSection';
import TagsSection from '../components/sections/TagsSection';
import TrackEventSection from '../components/sections/TrackEventSection';
import UserSection from '../components/sections/UserSection';

interface HomeScreenProps {
  logs: string[];
  onInit: (appId: string) => void;
  onLog: (msg: string) => void;
}

export default function HomeScreen({ logs, onInit, onLog }: HomeScreenProps) {
  return (
    <>
      <LogView logs={logs} />
      <AppSection onInit={onInit} onLog={onLog} />
      <UserSection onLog={onLog} />
      <PushSection onLog={onLog} />
      <AliasesSection onLog={onLog} />
      <EmailSection onLog={onLog} />
      <SmsSection onLog={onLog} />
      <TagsSection onLog={onLog} />
      <InAppMessagesSection onLog={onLog} />
      <OutcomesSection onLog={onLog} />
      <TrackEventSection onLog={onLog} />
      <LocationSection onLog={onLog} />
      <NotificationsSection onLog={onLog} />
      <LiveActivitySection onLog={onLog} />
    </>
  );
}
