import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: `http://${string}` | `https://${string}`;
};

function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await WebBrowser.openBrowserAsync(href);
        }
      }}
    />
  );
}

export default ExternalLink;
