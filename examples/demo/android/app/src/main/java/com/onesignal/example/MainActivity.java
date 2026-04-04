package com.onesignal.example;

import android.os.Bundle;
import android.view.View;
import java.util.Locale;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

/**
 * Edge-to-edge display support for Android 15+ (API 35+).
 *
 * On Android 15+, edge-to-edge is enforced: the status bar and navigation bar
 * are transparent and the app is expected to draw behind them. Capacitor's
 * built-in SystemBars plugin applies native padding to keep the WebView below
 * the status bar, but this leaves a white gap visible through the transparent
 * status bar.
 *
 * This override:
 * 1. Tells the window to let content draw behind system bars.
 * 2. Replaces the SystemBars insets listener so the WebView extends behind the
 *    status bar (top padding = 0). Only bottom padding is applied for the
 *    on-screen keyboard.
 * 3. Injects --ion-safe-area-* CSS variables so the web layer can add its own
 *    padding (e.g. the red app header) without overlapping the status bar icons.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }

    @Override
    protected void load() {
        super.load();

        float density = getResources().getDisplayMetrics().density;
        View webViewParent = (View) bridge.getWebView().getParent();

        // Override Capacitor's SystemBars insets listener (set during bridge.create())
        // so the WebView draws behind the status bar instead of being pushed below it.
        ViewCompat.setOnApplyWindowInsetsListener(webViewParent, (v, insets) -> {
            Insets systemBars = insets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            Insets imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime());
            boolean keyboardVisible = insets.isVisible(WindowInsetsCompat.Type.ime());

            // No top padding — the CSS header handles the status bar offset.
            // Bottom padding only when the keyboard is visible.
            v.setPadding(0, 0, 0, keyboardVisible ? imeInsets.bottom : 0);

            // Convert pixel insets to dp and inject as CSS variables.
            // WebView < 140 doesn't provide env(safe-area-inset-*) correctly,
            // so we set --ion-safe-area-* directly for Ionic to consume.
            int top = Math.round(systemBars.top / density);
            int right = Math.round(systemBars.right / density);
            int bottom = Math.round(systemBars.bottom / density);
            int left = Math.round(systemBars.left / density);
            String js = String.format(Locale.US,
                "document.documentElement.style.setProperty('--ion-safe-area-top','%dpx');"
                + "document.documentElement.style.setProperty('--ion-safe-area-right','%dpx');"
                + "document.documentElement.style.setProperty('--ion-safe-area-bottom','%dpx');"
                + "document.documentElement.style.setProperty('--ion-safe-area-left','%dpx');",
                top, right, bottom, left
            );
            bridge.getWebView().evaluateJavascript(js, null);

            return insets;
        });
    }
}
