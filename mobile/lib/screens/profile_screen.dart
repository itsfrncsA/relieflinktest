import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import 'change_password_screen.dart';
import 'login_screen.dart';

class ProfileScreen extends StatefulWidget {
  final String userName;
  final String email;
  final bool isTab;

  const ProfileScreen({
    super.key,
    required this.userName,
    required this.email,
    this.isTab = false,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final name = TextEditingController();
  final phone = TextEditingController();

  XFile? image;

  String id = '—';
  String email = '—';
  String join = '—';
  String status = 'Active';

  double total = 0;

  bool loading = true;
  bool editing = false;
  bool saving = false;

  @override
  void initState() {
    super.initState();
    name.text = widget.userName;
    email = widget.email;
    load();
  }

  @override
  void dispose() {
    name.dispose();
    phone.dispose();
    super.dispose();
  }

  Future<void> load() async {
    setState(() => loading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedId = prefs.getString('user_id') ?? '';
      final cachedCreated = prefs.getString('user_created_at') ?? '';

      if (cachedId.isNotEmpty && (id == '—' || id.isEmpty)) {
        id = cachedId;
      }
      if (cachedCreated.isNotEmpty && (join == '—' || join.isEmpty)) {
        try {
          final d = DateTime.parse(cachedCreated);
          join = '${d.month}/${d.day}/${d.year}';
        } catch (_) {}
      }
      if ((join == '—' || join.isEmpty) && id.length == 24) {
        try {
          final seconds = int.parse(id.substring(0, 8), radix: 16);
          final date = DateTime.fromMillisecondsSinceEpoch(seconds * 1000, isUtc: true).toLocal();
          join = '${date.month}/${date.day}/${date.year}';
        } catch (_) {}
      }

      final result = await ApiService().getUserProfile();

      if (!mounted) return;

      if (result['success'] == true &&
          result['data'] != null &&
          result['data'] is Map) {
        final data = result['data'] as Map;

        name.text =
            data['name']?.toString() ?? name.text;
        email =
            data['email']?.toString() ?? email;
        final rawId = data['_id'] ?? data['id'];
        if (rawId != null && rawId.toString().isNotEmpty && rawId.toString() != 'null') {
          id = rawId.toString();
          await prefs.setString('user_id', id);
        }
        phone.text =
            data['phone']?.toString() ?? '';

        final rawStatus = (data['status'] ?? 'Active').toString();
        status = rawStatus.isNotEmpty
            ? rawStatus[0].toUpperCase() + rawStatus.substring(1).toLowerCase()
            : 'Active';

        final raw = data['totalDonationAmount'];
        total = raw is num
            ? raw.toDouble()
            : double.tryParse(
                  raw?.toString() ?? '',
                ) ??
                0;

        final created = data['createdAt'];

        if (created != null && created.toString().isNotEmpty && created.toString() != 'null') {
          try {
            final date =
                DateTime.parse(created.toString());
            join =
                '${date.month}/${date.day}/${date.year}';
            await prefs.setString('user_created_at', created.toString());
          } catch (_) {}
        } else if (id.length == 24) {
          try {
            final seconds = int.parse(id.substring(0, 8), radix: 16);
            final date = DateTime.fromMillisecondsSinceEpoch(seconds * 1000, isUtc: true).toLocal();
            join = '${date.month}/${date.day}/${date.year}';
          } catch (_) {}
        }
      }

      final donResult = await ApiService().getDonationHistory();
      if (mounted && donResult['success'] == true && donResult['data'] is List) {
        final list = donResult['data'] as List;
        double calculatedTotal = 0;
        final currentUserName = name.text.trim().toLowerCase();
        final currentUserEmail = email.trim().toLowerCase();

        for (final item in list) {
          if (item is! Map) continue;
          final donation = item;
          final donor = (donation['donorName'] ?? '').toString().trim().toLowerCase();
          final dEmail = (donation['donorEmail'] ?? donation['email'] ?? '').toString().trim().toLowerCase();

          final isExactEmailMatch = currentUserEmail.isNotEmpty && dEmail.isNotEmpty && dEmail == currentUserEmail;
          final isExactNameMatch = currentUserName.isNotEmpty && donor.isNotEmpty && donor == currentUserName;

          if (isExactEmailMatch || isExactNameMatch) {
            final st = (donation['verificationStatus'] ?? donation['status'] ?? '').toString().toLowerCase();
            if (st.contains('approved') || st.contains('verified') || st.contains('complete')) {
              final amtRaw = donation['amount'];
              calculatedTotal += amtRaw is num
                  ? amtRaw.toDouble().abs()
                  : double.tryParse(amtRaw?.toString() ?? '')?.abs() ?? 0;
            }
          }
        }
        total = calculatedTotal;
      }
    } catch (_) {
      if (!mounted) return;

      _msg(
        'Unable to load your profile. Please try again.',
        error: true,
      );
    }

    if (!mounted) return;
    setState(() => loading = false);
  }

  Future<void> pick() async {
    try {
      final x = await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 75,
      );

      if (x != null && mounted) {
        setState(() => image = x);
      }
    } catch (_) {
      if (!mounted) return;

      _msg(
        'We could not open your image picker.',
        error: true,
      );
    }
  }

  Future<void> save() async {
    final fullName = name.text.trim();

    if (fullName.isEmpty) {
      _msg('Full name cannot be empty.', error: true);
      return;
    }

    if (!RegExp(r"^[a-zA-ZÀ-ÿ .'-]+$")
        .hasMatch(fullName)) {
      _msg('Please enter a valid name.', error: true);
      return;
    }

    if (id == '—') {
      _msg(
        'User information is unavailable. Refresh and try again.',
        error: true,
      );
      return;
    }

    setState(() => saving = true);

    try {
      final result = await ApiService().updateProfile(
        id,
        fullName,
        phoneNumber: phone.text.trim(),
      );

      if (!mounted) return;

      setState(() => saving = false);

      if (result['success'] == true) {
        setState(() => editing = false);
        _msg('Profile updated successfully.');
        await load();
      } else {
        _msg(
          _friendlyError(
            result['error'] ?? result['message'],
          ),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;

      setState(() => saving = false);
      _msg(
        'Unable to update your profile. Please try again.',
        error: true,
      );
    }
  }

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong. Please try again.';
    }

    return message.isEmpty
        ? 'Profile update failed. Please try again.'
        : message;
  }

  void _msg(String text, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          backgroundColor:
              error ? AppColors.errorColor : AppColors.successColor,
          content: Row(
            children: [
              Icon(
                error
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(text)),
            ],
          ),
        ),
      );
  }

  Future<void> logout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Row(
          children: [
            Icon(
              Icons.logout_rounded,
              color: AppColors.errorColor,
            ),
            SizedBox(width: 10),
            Text('Log out?'),
          ],
        ),
        content: const Text(
          'Are you sure you want to log out of ReliefLink?',
        ),
        actions: [
          TextButton(
            onPressed: () =>
                Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.errorColor,
            ),
            onPressed: () =>
                Navigator.pop(context, true),
            child: const Text('Log out'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await ApiService().clearToken();

      if (!mounted) return;

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (_) => const LoginScreen(),
        ),
        (_) => false,
      );
    }
  }

  void _privacyDialog() {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Row(
          children: [
            Icon(
              Icons.privacy_tip_outlined,
              color: AppColors.primaryColor,
            ),
            SizedBox(width: 10),
            Expanded(child: Text('Privacy & Terms')),
          ],
        ),
        content: const SingleChildScrollView(
          child: Text(
            'TERMS & CONDITIONS AND DATA PRIVACY GOVERNANCE POLICY\n'
            'ReliefLink • Sto. Domingo Parish Partner Hub\n\n'
            '1. ACCEPTANCE OF TERMS, INSTITUTIONAL SCOPE & BINDING AGREEMENT\n'
            'Welcome to ReliefLink, the official community disaster relief governance and donation management system operating in partnership with Sto. Domingo Parish (537 Quezon Avenue, Quezon City, Philippines). By accessing, registering an account, browsing, or utilizing our web and mobile applications, you acknowledge that you have read, understood, and agreed to be legally bound by these 15-Section Terms of Service and Data Privacy Policy. If you do not accept these terms, you must immediately cease all use of the platform.\n\n'
            '2. USER IDENTITY VERIFICATION, AGE ELIGIBILITY & REGISTRATION WARRANTIES\n'
            'Users registering an account on ReliefLink warrant that all registration information submitted—including full legal name, active mobile number, and valid email address—is truthful, current, and verifiable. Registration using fake identities, temporary disposable emails, or unauthorized pseudonyms is strictly prohibited. Registrants must be at least 18 years of age or authorized by a parent or legal guardian to submit monetary contributions or relief assistance applications.\n\n'
            '3. ACCOUNT CREDENTIALS SAFEGUARDS & PASSWORD COMPLEXITY RULES\n'
            'You are solely responsible for maintaining the strict confidentiality of your account credentials (email and password). Passwords must meet security complexity standards (minimum length, uppercase/lowercase letters, numbers, and special symbols) and must NOT contain spaces or forbidden symbols (< > " : ; \' / | { } [ ] ( ) - + =). You agree to notify parish administrators immediately upon discovering any unauthorized account access.\n\n'
            '4. FIDUCIARY FUND ALLOCATION, NON-PROFIT OPERATION & RELIEF GOODS INTEGRITY\n'
            'All monetary contributions made via GCash, Maya, Bank Transfer, QR Ph, or direct cash, as well as in-kind disaster relief goods (canned goods, rice, hygiene kits, medical supplies), are allocated strictly to verified Sto. Domingo Parish calamity response operations, scholar financial aid stipends, and community volunteer apostolates. ReliefLink operates on a 100% non-profit humanitarian basis with zero commercial administrative fee deductions or profit markups.\n\n'
            '5. PROOF OF PAYMENT VERIFICATION, ANTI-FRAUD PROTOCOLS & LEGAL PENALTIES\n'
            'Donors are required to provide authentic transaction reference numbers and valid proof-of-payment receipts. Submitting fake, altered, photoshopped, or duplicate payment screenshots constitutes fraud and is strictly prohibited. Any fraudulent submission will result in immediate permanent account termination, IP address blacklisting, and formal referral to civil and criminal prosecution under the Cybercrime Prevention Act of 2012 (RA 10175) and the Revised Penal Code.\n\n'
            '6. NON-REFUNDABILITY POLICY & IRREVOCABLE DISASTER EMERGENCY COMMITMENTS\n'
            'Monetary donations processed and verified through ReliefLink are committed immediately to real-time emergency relief purchasing, food pack assembly, medical aid deployment, or educational scholar disbursements. Consequently, all verified monetary donations are final, irrevocable, and non-refundable once committed to active relief project channels.\n\n'
            '7. BLOCKCHAIN AUDIT CONSENSUS, SMART CONTRACTS & IMMUTABLE LEDGER\n'
            'ReliefLink implements immutable smart contract transaction logging (Hyperledger Besu / private Ethereum ledger consensus) to guarantee complete financial transparency. Non-sensitive transactional metadata and cryptographic verification hashes are committed on-chain for open public and auditor verification. Sensitive personal information remains strictly protected on secure local parish servers.\n\n'
            '8. DATA PRIVACY COMPLIANCE (REPUBLIC ACT NO. 10173)\n'
            'ReliefLink strictly adheres to the Philippine Data Privacy Act of 2012 (RA 10173). Personal data collected—including donor names, contact details, transaction records, and proof-of-payment receipts—is processed exclusively for legitimate service delivery, donation verification, recipient aid distribution, and parish auditing. Personal data will never be sold, rented, or commercialized under any circumstances.\n\n'
            '9. ADVANCED SECURITY ARCHITECTURE, TLS 1.3 CRYPTOGRAPHY & ACCESS CONTROL\n'
            'All network communication is secured using TLS 1.3 encryption protocols. User passwords are stored using salted cryptographic bcrypt hashing algorithms. Administrative API endpoints require JWT authorization tokens with strict role-based access control (RBAC) enforcing least-privilege principles across all server endpoints.\n\n'
            '10. ACCEPTABLE SYSTEM USE & TECHNICAL SAFEGUARDS\n'
            'Users agree not to engage in any activity that compromises platform integrity, including: (a) attempting unauthorized access to administrative or database endpoints; (b) reverse engineering or decompiling application binaries; (c) injecting malicious scripts (SQL/XSS); (d) submitting false relief requests or fraudulent scholar credentials; or (e) transmitting automated spam or bot traffic.\n\n'
            '11. ADMINISTRATOR FIDUCIARY ACCOUNTABILITY & AUDIT TELEMETRY\n'
            'Parish administrators, relief staff, and volunteer coordinators with access to management dashboards are held to strict fiduciary and ethical standards. Any unauthorized manipulation of relief inventory, scholar stipends, or financial ledger logs is immutably recorded by audit telemetry and subject to immediate administrative disciplinary action and legal recourse.\n\n'
            '12. BENEFICIARY VERIFICATION & SECTOR AID GOVERNANCE\n'
            'Aid recipients, scholar stipend applicants, and sector beneficiaries must submit authentic documentation for verification by authorized Sto. Domingo Parish community coordinators. Misrepresentation of economic status, household income, or calamity displacement results in immediate revocation of aid eligibility.\n\n'
            '13. HUMANITARIAN SERVICE DISCLAIMERS & THIRD-PARTY GATEWAY LIMITATIONS\n'
            'ReliefLink operates on a non-profit humanitarian basis to support disaster-stricken communities. While we strive to maintain uninterrupted service availability, ReliefLink is not liable for temporary service interruptions caused by telecom network outages, scheduled server maintenance, or delays originating from third-party payment channels (such as GCash or financial institution gateways).\n\n'
            '14. INTELLECTUAL PROPERTY RIGHTS & SYSTEM OWNERSHIP\n'
            'All software source code, database architectures, user interface designs, ReliefLink logos, branding assets, and official parish relief documentation are the exclusive intellectual property of ReliefLink and Sto. Domingo Parish. Unauthorized copying, distribution, re-branding, or commercial exploitation is strictly prohibited without explicit written consent.\n\n'
            '15. POLICY AMENDMENTS, GOVERNING LAW & QUEZON CITY JURISDICTION\n'
            'ReliefLink reserves the right to modify or replace these 15-Section Terms of Service at any time. Notice of significant policy updates will be posted within the application. These terms are governed by and construed in accordance with the laws of the Republic of the Philippines. Any legal action or proceeding shall be submitted exclusively to the competent courts of Quezon City, Metro Manila. Official Contact: Relief Operations Desk, Sto. Domingo Parish, 537 Quezon Avenue, Quezon City, Philippines.',
            style: TextStyle(
              color: AppColors.subtitleColor,
              height: 1.5,
              fontSize: 13,
            ),
          ),
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final displayName =
        name.text.trim().isEmpty
            ? 'ReliefLink User'
            : name.text.trim();

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: !widget.isTab,
        title: const Text('My Profile'),
        actions: [
          IconButton(
            tooltip: 'Refresh',
            onPressed: loading ? null : load,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: load,
        color: AppColors.primaryColor,
        child: loading
            ? const Center(
                child: CircularProgressIndicator(),
              )
            : SingleChildScrollView(
                physics:
                    const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.fromLTRB(
                  18,
                  18,
                  18,
                  30,
                ),
                child: Center(
                  child: ConstrainedBox(
                    constraints:
                        const BoxConstraints(maxWidth: 720),
                    child: Column(
                      children: [
                        _profileHeader(displayName),
                        const SizedBox(height: 16),
                        _accountCard(),
                        const SizedBox(height: 12),
                        _settingsCard(),
                        const SizedBox(height: 12),
                        _logoutButton(),
                      ],
                    ),
                  ),
                ),
              ),
      ),
    );
  }

  Widget _profileHeader(String displayName) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 50,
                backgroundColor: Colors.white,
                backgroundImage:
                    (!kIsWeb && image != null)
                        ? FileImage(File(image!.path))
                        : null,
                child: image == null
                    ? Text(
                        _initials(displayName),
                        style: const TextStyle(
                          fontSize: 28,
                          fontWeight: FontWeight.w900,
                          color: AppColors.primaryColor,
                        ),
                      )
                    : null,
              ),
              GestureDetector(
                onTap: pick,
                child: Container(
                  padding: const EdgeInsets.all(9),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.camera_alt_outlined,
                    size: 18,
                    color: AppColors.primaryColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            displayName,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 23,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            email,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _accountCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            const Text(
              'Account Information',
              style: TextStyle(
                fontSize: 19,
                fontWeight: FontWeight.w900,
                color: AppColors.titleColor,
              ),
            ),
            const SizedBox(height: 16),
            _info(
              Icons.badge_outlined,
              'User ID',
              id,
            ),
            _info(
              Icons.email_outlined,
              'Email',
              email,
            ),
            if (editing) ...[
              const SizedBox(height: 4),
              TextField(
                controller: name,
                decoration: const InputDecoration(
                  labelText: 'Full name',
                  prefixIcon:
                      Icon(Icons.person_outline),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phone,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(
                  labelText: 'Phone number',
                  prefixIcon:
                      Icon(Icons.phone_outlined),
                ),
              ),
            ] else ...[
              _info(
                Icons.person_outline,
                'Full name',
                name.text,
              ),
              _info(
                Icons.phone_outlined,
                'Phone number',
                phone.text.isEmpty
                    ? 'Not provided'
                    : phone.text,
              ),
            ],
            _info(
              Icons.calendar_today_outlined,
              'Member since',
              join,
            ),
            _info(
              Icons.verified_outlined,
              'Account status',
              status,
            ),
            _info(
              Icons.volunteer_activism_outlined,
              'Total donations',
              '₱${total.toStringAsFixed(2)}',
            ),
            const SizedBox(height: 8),
            if (editing)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: saving
                          ? null
                          : () {
                              setState(
                                () => editing = false,
                              );
                            },
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: saving ? null : save,
                      child: saving
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child:
                                  CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text(
                              'Save changes',
                            ),
                    ),
                  ),
                ],
              )
            else
              ElevatedButton.icon(
                onPressed: () =>
                    setState(() => editing = true),
                icon: const Icon(Icons.edit_outlined),
                label: const Text('Edit profile'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _settingsCard() {
    return Card(
      child: Column(
        children: [
          ListTile(
            leading: _iconBox(Icons.lock_reset_rounded),
            title: const Text(
              'Change password',
              style: TextStyle(
                fontWeight: FontWeight.w800,
              ),
            ),
            subtitle: const Text(
              'Update your account password',
            ),
            trailing: const Icon(
              Icons.chevron_right_rounded,
            ),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) =>
                    ChangePasswordScreen(
                  email: email,
                ),
              ),
            ),
          ),
          const Divider(height: 1),
          ListTile(
            leading: _iconBox(
              Icons.privacy_tip_outlined,
            ),
            title: const Text(
              'Privacy & Terms',
              style: TextStyle(
                fontWeight: FontWeight.w800,
              ),
            ),
            subtitle: const Text(
              'Review data privacy and consent information',
            ),
            trailing: const Icon(
              Icons.chevron_right_rounded,
            ),
            onTap: _privacyDialog,
          ),
        ],
      ),
    );
  }

  Widget _logoutButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: logout,
        icon: const Icon(Icons.logout_rounded),
        label: const Text(
          'Log out',
          style: TextStyle(
            fontWeight: FontWeight.w800,
          ),
        ),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.errorColor,
          side: const BorderSide(
            color: AppColors.errorColor,
          ),
        ),
      ),
    );
  }

  Widget _iconBox(IconData icon) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(
        icon,
        color: AppColors.primaryColor,
        size: 20,
      ),
    );
  }

  String _initials(String value) {
    final words = value
        .trim()
        .split(RegExp(r'\s+'))
        .where((e) => e.isNotEmpty)
        .toList();

    if (words.isEmpty) return 'RL';

    return words
        .take(2)
        .map((e) => e[0])
        .join()
        .toUpperCase();
  }

  Widget _info(
    IconData icon,
    String label,
    String value,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius:
                  BorderRadius.circular(11),
            ),
            child: Icon(
              icon,
              size: 19,
              color: AppColors.primaryColor,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.subtitleColor,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value.isEmpty
                      ? 'Not provided'
                      : value,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppColors.titleColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
