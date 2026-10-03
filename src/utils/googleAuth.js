/**
 * Google Identity Services & OAuth Integration
 */

export function triggerGoogleSignIn({ clientId, onSuccess, onError }) {
  const googleClientId = clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId || googleClientId.includes("placeholder") || googleClientId.startsWith("1038192847291")) {
    onError?.(
      new Error(
        "Google Client ID is not configured. Please add your VITE_GOOGLE_CLIENT_ID in frontend/.env"
      )
    );
    return;
  }

  if (typeof window !== "undefined" && window.google?.accounts?.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccess({ credential: response.credential });
          } else {
            onError?.(new Error("No credential received from Google"));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Prompt Google One Tap / Account Picker
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is blocked or not displayed, fallback to Google OAuth Token Popup
          triggerGoogleOAuthPopup({ clientId: googleClientId, onSuccess, onError });
        }
      });
      return;
    } catch (err) {
      console.warn("[GoogleAuth] GIS prompt failed, attempting OAuth popup:", err);
    }
  }

  // Fallback to OAuth popup
  triggerGoogleOAuthPopup({ clientId: googleClientId, onSuccess, onError });
}

function triggerGoogleOAuthPopup({ clientId, onSuccess, onError }) {
  if (typeof window !== "undefined" && window.google?.accounts?.oauth2) {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "email profile openid",
        callback: async (tokenResponse) => {
          if (tokenResponse?.access_token) {
            try {
              // Fetch Google user profile using access token
              const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const userInfo = await userInfoRes.json();
              if (userInfo?.email) {
                onSuccess({
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                  googleId: userInfo.sub,
                });
              } else {
                onError?.(new Error("Failed to fetch Google profile"));
              }
            } catch (err) {
              onError?.(err);
            }
          }
        },
        error_callback: (err) => {
          onError?.(err);
        },
      });

      client.requestAccessToken();
      return;
    } catch (err) {
      console.warn("[GoogleAuth] OAuth2 client init error:", err);
    }
  }

  // Direct OAuth2 popup url if scripts haven't finished loading yet
  const redirectUri = window.location.origin;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=${Date.now()}`;

  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const popup = window.open(
    authUrl,
    "GoogleSignIn",
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
  );

  if (!popup) {
    onError?.(new Error("Popup blocked by browser. Please allow popups for this site."));
  }
}
