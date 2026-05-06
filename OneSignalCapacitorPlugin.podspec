require 'json'

package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

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
  s.dependency 'OneSignalXCFramework', '5.5.1'
end
