require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))
onesignal_xcframework_version = '5.5.4'
onesignal_disable_location_env = ENV['ONESIGNAL_DISABLE_LOCATION'].to_s.strip.downcase
onesignal_disable_location = ['true', '1'].include?(onesignal_disable_location_env)

Pod::Spec.new do |s|
  s.name = 'OnesignalCapacitorPlugin'
  s.version = package['version']
  s.summary = 'OneSignal Push Notifications Capacitor Plugin'
  s.license = package['license']
  s.homepage = package['homepage']
  s.author = 'OneSignal'
  s.source = { :git => package['repository']['url'], :tag => s.version.to_s }
  s.source_files = [
    'ios/Sources/OneSignalCapacitorPlugin/**/*.swift',
    'ios/Sources/OSCapacitorLaunchOptions/**/*.{h,m}'
  ]
  s.public_header_files = 'ios/Sources/OSCapacitorLaunchOptions/include/*.h'

  s.ios.deployment_target = '14.0'
  s.swift_version = '5.9'

  s.dependency 'Capacitor'
  if onesignal_disable_location
    s.dependency 'OneSignalXCFramework/OneSignal', onesignal_xcframework_version
    s.dependency 'OneSignalXCFramework/OneSignalInAppMessages', onesignal_xcframework_version
  else
    s.dependency 'OneSignalXCFramework', onesignal_xcframework_version
  end
end
