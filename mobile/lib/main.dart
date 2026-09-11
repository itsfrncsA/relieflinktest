import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'theme.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('auth_token');
  final savedName = prefs.getString('user_name') ?? '';
  final savedEmail = prefs.getString('user_email') ?? '';

  Widget initialScreen = const LoginScreen();

  if (token != null && token.isNotEmpty) {
    initialScreen = HomeScreen(
      userName: savedName.isNotEmpty
          ? savedName
          : (savedEmail.isNotEmpty ? savedEmail.split('@').first : 'User'),
      email: savedEmail,
    );
  }

  runApp(ReliefLinkApp(initialScreen: initialScreen));
}

class ReliefLinkApp extends StatelessWidget {
  final Widget initialScreen;

  const ReliefLinkApp({
    super.key,
    this.initialScreen = const LoginScreen(),
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'ReliefLink',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: initialScreen,
    );
  }
}