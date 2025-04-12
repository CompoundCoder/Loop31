import { useState } from 'react';
import { SettingsContainer, SettingsSection, SettingItem } from './SettingsScreenTemplate';

export default function ComposingSettingsScreen() {
  const [autoHashtags, setAutoHashtags] = useState(true);
  const [spellCheck, setSpellCheck] = useState(true);
  const [linkShortening, setLinkShortening] = useState(false);
  const [imageOptimization, setImageOptimization] = useState(true);
  const [watermark, setWatermark] = useState(false);

  return (
    <SettingsContainer>
      <SettingsSection title="Text & Links">
        <SettingItem
          label="Default Caption Template"
          icon="text-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Auto Hashtags"
          toggle={autoHashtags}
          onToggle={setAutoHashtags}
          icon="pricetag-outline"
          iconColor="#FF9500"
        />
        <SettingItem
          label="Spell Check"
          toggle={spellCheck}
          onToggle={setSpellCheck}
          icon="checkmark-circle-outline"
          iconColor="#34C759"
        />
        <SettingItem
          label="Link Shortening"
          toggle={linkShortening}
          onToggle={setLinkShortening}
          icon="link-outline"
          iconColor="#5856D6"
          value={linkShortening ? "Enabled" : "No Shortening"}
        />
      </SettingsSection>

      <SettingsSection title="Media Settings">
        <SettingItem
          label="Image Optimization"
          toggle={imageOptimization}
          onToggle={setImageOptimization}
          icon="image-outline"
          iconColor="#FF2D55"
        />
        <SettingItem
          label="Default Image Size"
          value="1080 × 1080"
          icon="resize-outline"
          iconColor="#8E8E93"
          onPress={() => {}}
        />
        <SettingItem
          label="Watermark"
          toggle={watermark}
          onToggle={setWatermark}
          icon="water-outline"
          iconColor="#FF3B30"
        />
      </SettingsSection>

      <SettingsSection title="Hashtag Management">
        <SettingItem
          label="Hashtag Groups"
          value="3 groups"
          icon="pricetags-outline"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Trending Hashtags"
          icon="trending-up-outline"
          iconColor="#34C759"
          onPress={() => {}}
        />
        <SettingItem
          label="Banned Hashtags"
          icon="alert-circle-outline"
          iconColor="#FF3B30"
          onPress={() => {}}
        />
      </SettingsSection>

      <SettingsSection title="Platform Defaults">
        <SettingItem
          label="Instagram Format"
          value="Square"
          icon="logo-instagram"
          iconColor="#FF2D55"
          onPress={() => {}}
        />
        <SettingItem
          label="Twitter Format"
          value="Standard"
          icon="logo-twitter"
          iconColor="#007AFF"
          onPress={() => {}}
        />
        <SettingItem
          label="Facebook Format"
          value="Auto"
          icon="logo-facebook"
          iconColor="#5856D6"
          onPress={() => {}}
        />
      </SettingsSection>
    </SettingsContainer>
  );
} 