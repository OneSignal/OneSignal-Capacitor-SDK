# `cap sync` adds every Capacitor plugin to the Podfile by path, so without this
# file pod-based apps fail with an unhelpful "No podspec found" error.
raise Pod::Informative, <<~MSG
  @onesignal/capacitor-plugin no longer supports CocoaPods. Migrate the iOS app to Swift Package Manager:
    npx cap spm-migration-assistant
  See https://capacitorjs.com/docs/ios/spm
MSG
