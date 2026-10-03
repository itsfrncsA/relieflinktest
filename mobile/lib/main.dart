
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'theme.dart';
import 'screens/splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Keep the app in portrait orientation.
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  runApp(const ReliefLinkApp());
}

class ReliefLinkApp extends StatelessWidget {
  const ReliefLinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReliefLink',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,

      // Splash Screen is now the first screen.
      home: const SplashScreen(),
    );
  }
}
