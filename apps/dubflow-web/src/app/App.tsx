import { Route, Routes } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import HowItWorksPage from '@/pages/HowItWorksPage';
import PricingPage from '@/pages/PricingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import ProjectsPage from '@/pages/ProjectsPage';
import CreateProjectPage from '@/pages/CreateProjectPage';
import SettingsPage from '@/pages/SettingsPage';
import UsagePage from '@/pages/UsagePage';
import HelpPage from '@/pages/HelpPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import ProjectProcessingPage from '@/pages/ProjectProcessingPage';
import VoicesPage from '@/pages/VoicesPage';
import AIToolsPage from '@/pages/AIToolsPage';
import SubtitleToolPage from '@/pages/SubtitleToolPage';
import TranscriptToolPage from '@/pages/TranscriptToolPage';
import TranslationStudioPage from '@/pages/TranslationToolPage';
import VoiceToolPage from '@/pages/VoiceToolPage';
import VideoToolsPage from '@/pages/VideoToolsPage';
import MediaPage from '@/pages/MediaPage';
import TemplatesPage from '@/pages/TemplatesPage';
import ProductPage from '@/pages/ProductPage';
import PublicVoicesPage from '@/pages/PublicVoicesPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import AuthLayout from '@/layouts/AuthLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/ai-dubbing" element={<ProductPage />} />
        <Route path="/ai-subtitles" element={<ProductPage />} />
        <Route path="/ai-translation" element={<ProductPage />} />
        <Route path="/voices" element={<PublicVoicesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<CreateProjectPage />} />
        <Route path="/app/projects/new" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/app/projects/:projectId/studio" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/processing" element={<ProjectProcessingPage />} />
        <Route path="/workspace/voices" element={<VoicesPage />} />
        <Route path="/app/voices" element={<VoicesPage />} />
        <Route path="/tools" element={<AIToolsPage />} />
        <Route path="/tools/subtitles" element={<SubtitleToolPage />} />
        <Route path="/tools/transcript" element={<TranscriptToolPage />} />
        <Route path="/tools/translation" element={<TranslationStudioPage />} />
        <Route path="/tools/voice" element={<VoiceToolPage />} />
        <Route path="/tools/video" element={<VideoToolsPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}
