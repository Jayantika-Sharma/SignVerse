import { useApp } from '../lib/store.jsx';
import { ManageProfile, AddProfile } from './ProfileModals.jsx';
import HelpChat from './HelpChat.jsx';
import SettingsModal from './SettingsModal.jsx';

export default function Modals() {
  const { modal, closeModal } = useApp();
  if (modal === 'profile') return <ManageProfile onClose={closeModal} />;
  if (modal === 'addprofile') return <AddProfile onClose={closeModal} />;
  if (modal === 'help') return <HelpChat onClose={closeModal} />;
  if (modal === 'settings') return <SettingsModal onClose={closeModal} />;
  return null;
}
