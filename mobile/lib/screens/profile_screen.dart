import 'dart:typed_data';

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
  final VoidCallback? onBackToHome;

  const ProfileScreen({
    super.key,
    required this.userName,
    required this.email,
    this.isTab = false,
    this.onBackToHome,
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final name = TextEditingController();

  XFile? image;
  Uint8List? imageBytes;
  String? profileImageUrl;

  String id = '—';
  String email = '—';
  String join = '—';
  String status = 'Active';

  double total = 0;

  // Loading is still used when profile data is being fetched.
  // The user does not need to press a refresh button.
  bool loading = true;

  bool editing = false;
  bool saving = false;

  @override
  void initState() {
    super.initState();

    name.text = widget.userName;
    email = widget.email;

    // Automatically load the profile when the screen opens.
    load();
  }

  @override
  void dispose() {
    name.dispose();
    super.dispose();
  }

  // ------------------------------------------------------------
  // LOAD PROFILE
  // ------------------------------------------------------------

  Future<void> load() async {
    if (mounted) {
      setState(() => loading = true);
    }

    try {
      final prefs = await SharedPreferences.getInstance();

      final cachedId = prefs.getString('user_id') ?? '';
      final cachedCreated =
          prefs.getString('user_created_at') ?? '';

      // Use cached user ID while waiting for the API.
      if (cachedId.isNotEmpty &&
          (id == '—' || id.isEmpty)) {
        id = cachedId;
      }

      // Use cached account creation date if available.
      if (cachedCreated.isNotEmpty &&
          (join == '—' || join.isEmpty)) {
        try {
          final d = DateTime.parse(cachedCreated);

          join = '${d.month}/${d.day}/${d.year}';
        } catch (_) {}
      }

      // Try to get the date from MongoDB ObjectId if needed.
      if ((join == '—' || join.isEmpty) &&
          id.length == 24) {
        try {
          final seconds = int.parse(
            id.substring(0, 8),
            radix: 16,
          );

          final date =
              DateTime.fromMillisecondsSinceEpoch(
            seconds * 1000,
            isUtc: true,
          ).toLocal();

          join = '${date.month}/${date.day}/${date.year}';
        } catch (_) {}
      }

      // Get the latest profile information.
      final result =
          await ApiService().getUserProfile();

      if (!mounted) return;

      if (result['success'] == true &&
          result['data'] != null &&
          result['data'] is Map) {
        final data = result['data'] as Map;

        name.text =
            data['name']?.toString() ?? name.text;

        email =
            data['email']?.toString() ?? email;

        // Get user ID.
        final rawId = data['_id'] ?? data['id'];

        if (rawId != null &&
            rawId.toString().isNotEmpty &&
            rawId.toString() != 'null') {
          id = rawId.toString();

          await prefs.setString(
            'user_id',
            id,
          );
        }

        // Get profile photo.
        final imgPath =
            data['profileImage']?.toString();

        if (imgPath != null &&
            imgPath.isNotEmpty &&
            imgPath != 'null') {
          profileImageUrl = imgPath;
        }

        // Get account status.
        final rawStatus =
            (data['status'] ?? 'Active').toString();

        status = rawStatus.isNotEmpty
            ? rawStatus[0].toUpperCase() +
                rawStatus.substring(1).toLowerCase()
            : 'Active';

        // Get total donation amount.
        final raw = data['totalDonationAmount'];

        total = raw is num
            ? raw.toDouble()
            : double.tryParse(
                  raw?.toString() ?? '',
                ) ??
                0;

        // Get account creation date.
        final created = data['createdAt'];

        if (created != null &&
            created.toString().isNotEmpty &&
            created.toString() != 'null') {
          try {
            final date =
                DateTime.parse(created.toString());

            join =
                '${date.month}/${date.day}/${date.year}';

            await prefs.setString(
              'user_created_at',
              created.toString(),
            );
          } catch (_) {}
        } else if (id.length == 24) {
          try {
            final seconds = int.parse(
              id.substring(0, 8),
              radix: 16,
            );

            final date =
                DateTime.fromMillisecondsSinceEpoch(
              seconds * 1000,
              isUtc: true,
            ).toLocal();

            join =
                '${date.month}/${date.day}/${date.year}';
          } catch (_) {}
        }
      }

      // --------------------------------------------------------
      // GET DONATION HISTORY
      // --------------------------------------------------------

      final donResult =
          await ApiService().getDonationHistory();

      if (mounted &&
          donResult['success'] == true &&
          donResult['data'] is List) {
        final list =
            donResult['data'] as List;

        double calculatedTotal = 0;

        final currentUserName =
            name.text.trim().toLowerCase();

        final currentUserEmail =
            email.trim().toLowerCase();

        for (final item in list) {
          if (item is! Map) continue;

          final donation = item;

          final donor =
              (donation['donorName'] ?? '')
                  .toString()
                  .trim()
                  .toLowerCase();

          final dEmail =
              (donation['donorEmail'] ??
                      donation['email'] ??
                      '')
                  .toString()
                  .trim()
                  .toLowerCase();

          final isExactEmailMatch =
              currentUserEmail.isNotEmpty &&
                  dEmail.isNotEmpty &&
                  dEmail == currentUserEmail;

          final isExactNameMatch =
              currentUserName.isNotEmpty &&
                  donor.isNotEmpty &&
                  donor == currentUserName;

          if (isExactEmailMatch ||
              isExactNameMatch) {
            final st =
                (donation['verificationStatus'] ??
                        donation['status'] ??
                        '')
                    .toString()
                    .toLowerCase();

            if (st.contains('approved') ||
                st.contains('verified') ||
                st.contains('complete')) {
              final amtRaw =
                  donation['amount'];

              calculatedTotal += amtRaw is num
                  ? amtRaw.toDouble().abs()
                  : double.tryParse(
                        amtRaw?.toString() ?? '',
                      )?.abs() ??
                      0;
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

  // ------------------------------------------------------------
  // PROFILE PHOTO
  // ------------------------------------------------------------

  Future<void> pick() async {
    try {
      final x =
          await ImagePicker().pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (x != null && mounted) {
        final bytes = await x.readAsBytes();

        setState(() {
          image = x;
          imageBytes = bytes;
        });

        if (id != '—' && id.isNotEmpty) {
          final uploadRes =
              await ApiService().uploadProfileImage(
            id,
            filePath:
                kIsWeb ? null : x.path,
            bytes: bytes,
            fileName: x.name,
          );

          if (uploadRes['success'] == true) {
            final uploadedPath =
                uploadRes['profileImage']
                    ?.toString() ??
                    uploadRes['data']
                        ?['profileImage']
                        ?.toString();

            if (uploadedPath != null &&
                mounted) {
              setState(() {
                profileImageUrl =
                    uploadedPath;
              });
            }

            _msg(
              'Profile photo updated successfully.',
            );
          }
        }
      }
    } catch (_) {
      if (!mounted) return;

      _msg(
        'We could not open your image picker.',
        error: true,
      );
    }
  }

  // ------------------------------------------------------------
  // SAVE NAME
  // ------------------------------------------------------------

  Future<void> save() async {
    final fullName =
        name.text.trim();

    if (fullName.isEmpty) {
      _msg(
        'Full name cannot be empty.',
        error: true,
      );
      return;
    }

    if (!RegExp(
      r"^[a-zA-ZÀ-ÿ .'-]+$",
    ).hasMatch(fullName)) {
      _msg(
        'Please enter a valid name.',
        error: true,
      );
      return;
    }

    if (id == '—') {
      _msg(
        'User information is unavailable. Please try again.',
        error: true,
      );
      return;
    }

    setState(() => saving = true);

    try {
      // Only update the name.
      final result =
          await ApiService().updateProfile(
        id,
        fullName,
      );

      if (!mounted) return;

      setState(() => saving = false);

      if (result['success'] == true) {
        setState(() => editing = false);

        _msg(
          'Name updated successfully.',
        );

        // Automatically get the latest profile data.
        await load();
      } else {
        _msg(
          _friendlyError(
            result['error'] ??
                result['message'],
          ),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;

      setState(() => saving = false);

      _msg(
        'Unable to update your name. Please try again.',
        error: true,
      );
    }
  }

  String _friendlyError(dynamic value) {
    final message =
        value?.toString() ?? '';

    final lower =
        message.toLowerCase();

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
        ? 'Name update failed. Please try again.'
        : message;
  }

  // ------------------------------------------------------------
  // MESSAGE
  // ------------------------------------------------------------

  void _msg(
    String text, {
    bool error = false,
  }) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          backgroundColor:
              error
                  ? AppColors.errorColor
                  : AppColors.successColor,
          content: Row(
            children: [
              Icon(
                error
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(text),
              ),
            ],
          ),
        ),
      );
  }

  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------

  Future<void> logout() async {
    final confirmed =
        await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius:
              BorderRadius.circular(20),
        ),
        title: const Row(
          children: [
            Icon(
              Icons.logout_rounded,
              color:
                  AppColors.errorColor,
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
                Navigator.pop(
              context,
              false,
            ),
            child: const Text(
              'Cancel',
            ),
          ),
          FilledButton(
            style:
                FilledButton.styleFrom(
              backgroundColor:
                  AppColors.errorColor,
            ),
            onPressed: () =>
                Navigator.pop(
              context,
              true,
            ),
            child: const Text(
              'Log out',
            ),
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
          builder: (_) =>
              const LoginScreen(),
        ),
        (_) => false,
      );
    }
  }

  // ------------------------------------------------------------
  // BUILD PROFILE SCREEN
  // ------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final displayName =
        name.text.trim().isEmpty
            ? 'ReliefLink User'
            : name.text.trim();

    return Scaffold(
      backgroundColor:
          AppColors.backgroundColor,

      appBar: AppBar(
        automaticallyImplyLeading:
            false,

        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
          ),
          tooltip: 'Back',
          onPressed: () {
            if (widget.onBackToHome !=
                null) {
              widget.onBackToHome!();
            } else if (Navigator.canPop(
              context,
            )) {
              Navigator.pop(context);
            }
          },
        ),

        title: const Text(
          'Profile',
          style: TextStyle(
            fontWeight: FontWeight.w800,
          ),
        ),

        // No refresh button here.
        // Profile loads automatically.
      ),

      body: RefreshIndicator(
        onRefresh: load,
        color: AppColors.primaryColor,

        child: loading
            ? const Center(
                child:
                    CircularProgressIndicator(),
              )
            : SingleChildScrollView(
                physics:
                    const AlwaysScrollableScrollPhysics(),

                padding:
                    const EdgeInsets.fromLTRB(
                  18,
                  18,
                  18,
                  30,
                ),

                child: Center(
                  child: ConstrainedBox(
                    constraints:
                        const BoxConstraints(
                      maxWidth: 720,
                    ),

                    child: Column(
                      children: [
                        _profileHeader(
                          displayName,
                        ),

                        const SizedBox(
                          height: 18,
                        ),

                        // Account Information
                        _profileMenu(
                          icon:
                              Icons.person_outline_rounded,
                          title:
                              'Account Information',
                          subtitle:
                              'View your personal and account details',
                          onTap:
                              _openAccountInformation,
                        ),

                        const SizedBox(
                          height: 10,
                        ),

                        // Security
                        _profileMenu(
                          icon:
                              Icons.lock_outline_rounded,
                          title:
                              'Change Password',
                          subtitle:
                              'Update your account password',
                          onTap: () =>
                              Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) =>
                                  ChangePasswordScreen(
                                email: email,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(
                          height: 18,
                        ),

                        _logoutButton(),
                      ],
                    ),
                  ),
                ),
              ),
      ),
    );
  }

  // ------------------------------------------------------------
  // PROFILE HEADER
  // ------------------------------------------------------------

  Widget _profileHeader(
    String displayName,
  ) {
    ImageProvider? avatarProvider;

    if (imageBytes != null &&
        imageBytes!.isNotEmpty) {
      avatarProvider =
          MemoryImage(imageBytes!);
    } else if (profileImageUrl != null &&
        profileImageUrl!.isNotEmpty) {
      final cleanUrl =
          profileImageUrl!.startsWith('http')
              ? profileImageUrl!
              : '${ApiService.baseUrl.replaceAll('/api', '')}$profileImageUrl';

      avatarProvider =
          NetworkImage(cleanUrl);
    }

    return Container(
      width: double.infinity,

      padding:
          const EdgeInsets.all(22),

      decoration: BoxDecoration(
        gradient:
            const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
          begin:
              Alignment.topLeft,
          end:
              Alignment.bottomRight,
        ),

        borderRadius:
            BorderRadius.circular(24),

        boxShadow: [
          BoxShadow(
            color: AppColors.primaryColor
                .withValues(alpha: 0.16),
            blurRadius: 18,
            offset:
                const Offset(0, 8),
          ),
        ],
      ),

      child: Row(
        children: [
          // Profile photo
          Stack(
            alignment:
                Alignment.bottomRight,
            children: [
              CircleAvatar(
                radius: 38,
                backgroundColor:
                    Colors.white,
                backgroundImage:
                    avatarProvider,

                child:
                    avatarProvider == null
                        ? Text(
                            _initials(
                              displayName,
                            ),
                            style:
                                const TextStyle(
                              fontSize: 23,
                              fontWeight:
                                  FontWeight.w900,
                              color: AppColors
                                  .primaryColor,
                            ),
                          )
                        : null,
              ),

              GestureDetector(
                onTap: pick,
                child: Container(
                  padding:
                      const EdgeInsets.all(
                    7,
                  ),

                  decoration:
                      const BoxDecoration(
                    color: Colors.white,
                    shape:
                        BoxShape.circle,
                  ),

                  child: const Icon(
                    Icons
                        .camera_alt_outlined,
                    size: 15,
                    color: AppColors
                        .primaryColor,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(width: 16),

          // Name and account status
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  displayName,
                  maxLines: 2,
                  overflow:
                      TextOverflow.ellipsis,
                  style:
                      const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight:
                        FontWeight.w900,
                  ),
                ),

                const SizedBox(
                  height: 9,
                ),

                // Account status
                Container(
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 9,
                    vertical: 5,
                  ),

                  decoration:
                      BoxDecoration(
                    color: Colors.white
                        .withValues(alpha: 0.14),
                    borderRadius:
                        BorderRadius.circular(
                      20,
                    ),
                    border: Border.all(
                      color: Colors.white
                          .withValues(
                        alpha: 0.20,
                      ),
                    ),
                  ),

                  child: Row(
                    mainAxisSize:
                        MainAxisSize.min,
                    children: [
                      Container(
                        width: 7,
                        height: 7,
                        decoration:
                            const BoxDecoration(
                          color:
                              Colors.greenAccent,
                          shape:
                              BoxShape.circle,
                        ),
                      ),
                      const SizedBox(
                        width: 6,
                      ),
                      Text(
                        status,
                        style:
                            const TextStyle(
                          color:
                              Colors.white,
                          fontSize: 11,
                          fontWeight:
                              FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // PROFILE MENU ITEM
  // ------------------------------------------------------------

  Widget _profileMenu({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,

      child: InkWell(
        borderRadius:
            BorderRadius.circular(18),
        onTap: onTap,

        child: Ink(
          width: double.infinity,

          padding:
              const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 15,
          ),

          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius:
                BorderRadius.circular(18),
            border: Border.all(
              color: Colors.grey
                  .withValues(alpha: 0.10),
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black
                    .withValues(alpha: 0.035),
                blurRadius: 10,
                offset:
                    const Offset(0, 3),
              ),
            ],
          ),

          child: Row(
            children: [
              _iconBox(icon),

              const SizedBox(width: 13),

              Expanded(
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style:
                          const TextStyle(
                        fontSize: 15,
                        fontWeight:
                            FontWeight.w800,
                        color:
                            AppColors.titleColor,
                      ),
                    ),

                    const SizedBox(
                      height: 3,
                    ),

                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow:
                          TextOverflow.ellipsis,
                      style:
                          const TextStyle(
                        fontSize: 11.5,
                        color:
                            AppColors.subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              const Icon(
                Icons
                    .chevron_right_rounded,
                color:
                    AppColors.subtitleColor,
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // ACCOUNT INFORMATION SCREEN
  // ------------------------------------------------------------

  void _openAccountInformation() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) =>
            AccountInformationScreen(
          name: name.text,
          email: email,
          join: join,
          status: status,
          onEditName:
              _openEditName,
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // EDIT NAME
  // ------------------------------------------------------------

  void _openEditName() {
    Navigator.pop(context);

    setState(() {
      editing = true;
    });

    // Show the edit name dialog instead of making
    // the main Profile page longer.
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor:
          Colors.transparent,
      builder: (_) {
        return _editNameSheet();
      },
    );
  }

  Widget _editNameSheet() {
    return StatefulBuilder(
      builder: (
        context,
        setModalState,
      ) {
        return Padding(
          padding:
              EdgeInsets.only(
            bottom:
                MediaQuery.of(context)
                    .viewInsets
                    .bottom,
          ),

          child: Container(
            padding:
                const EdgeInsets.fromLTRB(
              20,
              10,
              20,
              24,
            ),

            decoration:
                const BoxDecoration(
              color: Colors.white,
              borderRadius:
                  BorderRadius.vertical(
                top: Radius.circular(26),
              ),
            ),

            child: Column(
              mainAxisSize:
                  MainAxisSize.min,
              crossAxisAlignment:
                  CrossAxisAlignment.start,

              children: [
                Center(
                  child: Container(
                    width: 42,
                    height: 4,
                    decoration:
                        BoxDecoration(
                      color:
                          Colors.grey.shade300,
                      borderRadius:
                          BorderRadius.circular(
                        10,
                      ),
                    ),
                  ),
                ),

                const SizedBox(
                  height: 20,
                ),

                const Text(
                  'Edit Name',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight:
                        FontWeight.w900,
                    color:
                        AppColors.titleColor,
                  ),
                ),

                const SizedBox(
                  height: 5,
                ),

                const Text(
                  'Update your account name.',
                  style: TextStyle(
                    color:
                        AppColors.subtitleColor,
                    fontSize: 12,
                  ),
                ),

                const SizedBox(
                  height: 18,
                ),

                TextField(
                  controller: name,
                  textCapitalization:
                      TextCapitalization.words,
                  decoration:
                      const InputDecoration(
                    labelText:
                        'Full name',
                    prefixIcon:
                        Icon(
                      Icons
                          .person_outline,
                    ),
                  ),
                ),

                const SizedBox(
                  height: 18,
                ),

                Row(
                  children: [
                    Expanded(
                      child:
                          OutlinedButton(
                        onPressed: saving
                            ? null
                            : () {
                                Navigator.pop(
                                  context,
                                );

                                setState(
                                  () =>
                                      editing =
                                          false,
                                );
                              },
                        child:
                            const Text(
                          'Cancel',
                        ),
                      ),
                    ),

                    const SizedBox(
                      width: 10,
                    ),

                    Expanded(
                      child:
                          ElevatedButton(
                        onPressed: saving
                            ? null
                            : () async {
                                setModalState(
                                  () =>
                                      saving =
                                          true,
                                );

                                await save();

                                if (mounted) {
                                  setModalState(
                                    () =>
                                        saving =
                                            false,
                                  );
                                }
                              },

                        child: saving
                            ? const SizedBox(
                                width: 20,
                                height: 20,
                                child:
                                    CircularProgressIndicator(
                                  strokeWidth:
                                      2,
                                  color: Colors
                                      .white,
                                ),
                              )
                            : const Text(
                                'Save Name',
                              ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // ------------------------------------------------------------
  // LOGOUT BUTTON
  // ------------------------------------------------------------

  Widget _logoutButton() {
    return SizedBox(
      width: double.infinity,

      child:
          OutlinedButton.icon(
        onPressed: logout,

        icon: const Icon(
          Icons.logout_rounded,
        ),

        label: const Text(
          'Log out',
          style: TextStyle(
            fontWeight:
                FontWeight.w800,
          ),
        ),

        style:
            OutlinedButton.styleFrom(
          foregroundColor:
              AppColors.errorColor,

          side:
              const BorderSide(
            color:
                AppColors.errorColor,
          ),

          padding:
              const EdgeInsets.symmetric(
            vertical: 14,
          ),

          shape:
              RoundedRectangleBorder(
            borderRadius:
                BorderRadius.circular(
              14,
            ),
          ),
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // ICON BOX
  // ------------------------------------------------------------

  Widget _iconBox(
    IconData icon,
  ) {
    return Container(
      width: 42,
      height: 42,

      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius:
            BorderRadius.circular(12),
      ),

      child: Icon(
        icon,
        color:
            AppColors.primaryColor,
        size: 20,
      ),
    );
  }

  // ------------------------------------------------------------
  // INITIALS
  // ------------------------------------------------------------

  String _initials(
    String value,
  ) {
    final words = value
        .trim()
        .split(RegExp(r'\s+'))
        .where(
          (e) => e.isNotEmpty,
        )
        .toList();

    if (words.isEmpty) {
      return 'RL';
    }

    return words
        .take(2)
        .map((e) => e[0])
        .join()
        .toUpperCase();
  }
}

// ============================================================
// ACCOUNT INFORMATION SCREEN
// ============================================================

class AccountInformationScreen
    extends StatelessWidget {
  final String name;
  final String email;
  final String join;
  final String status;
  final VoidCallback onEditName;

  const AccountInformationScreen({
    super.key,
    required this.name,
    required this.email,
    required this.join,
    required this.status,
    required this.onEditName,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor:
          AppColors.backgroundColor,

      appBar: AppBar(
        title: const Text(
          'Account Information',
          style: TextStyle(
            fontWeight:
                FontWeight.w800,
          ),
        ),
      ),

      body: SingleChildScrollView(
        padding:
            const EdgeInsets.fromLTRB(
          18,
          18,
          18,
          30,
        ),

        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,

          children: [
            // --------------------------------------------------
            // PERSONAL DETAILS
            // --------------------------------------------------

            const Text(
              'Personal Details',
              style: TextStyle(
                fontSize: 15,
                fontWeight:
                    FontWeight.w900,
                color:
                    AppColors.titleColor,
              ),
            ),

            const SizedBox(
              height: 10,
            ),

            _detailsCard(
              children: [
                _detailItem(
                  Icons
                      .person_outline_rounded,
                  'Full Name',
                  name,
                ),

                _detailDivider(),

                _detailItem(
                  Icons
                      .email_outlined,
                  'Email Address',
                  email,
                ),
              ],
            ),

            const SizedBox(
              height: 20,
            ),

            // --------------------------------------------------
            // ACCOUNT DETAILS
            // --------------------------------------------------

            const Text(
              'Account Details',
              style: TextStyle(
                fontSize: 15,
                fontWeight:
                    FontWeight.w900,
                color:
                    AppColors.titleColor,
              ),
            ),

            const SizedBox(
              height: 10,
            ),

            _detailsCard(
              children: [
                _detailItem(
                  Icons
                      .calendar_today_outlined,
                  'Member Since',
                  join,
                ),

                _detailDivider(),

                _detailItem(
                  Icons
                      .verified_outlined,
                  'Account Status',
                  status,
                  valueWidget:
                      _statusBadge(),
                ),
              ],
            ),

            const SizedBox(
              height: 22,
            ),

            // --------------------------------------------------
            // EDIT NAME
            // --------------------------------------------------

            SizedBox(
              width: double.infinity,

              child:
                  ElevatedButton.icon(
                onPressed:
                    onEditName,

                icon: const Icon(
                  Icons
                      .edit_outlined,
                ),

                label: const Text(
                  'Edit Name',
                  style: TextStyle(
                    fontWeight:
                        FontWeight.w800,
                  ),
                ),

                style:
                    ElevatedButton.styleFrom(
                  padding:
                      const EdgeInsets
                          .symmetric(
                    vertical: 14,
                  ),

                  shape:
                      RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius
                            .circular(
                      14,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // DETAILS CARD
  // ------------------------------------------------------------

  Widget _detailsCard({
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,

      padding:
          const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 4,
      ),

      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius:
            BorderRadius.circular(18),
        border: Border.all(
          color: Colors.grey
              .withValues(alpha: 0.10),
        ),
      ),

      child: Column(
        children: children,
      ),
    );
  }

  // ------------------------------------------------------------
  // DETAIL ITEM
  // ------------------------------------------------------------

  Widget _detailItem(
    IconData icon,
    String label,
    String value, {
    Widget? valueWidget,
  }) {
    return Padding(
      padding:
          const EdgeInsets.symmetric(
        vertical: 14,
      ),

      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,

        children: [
          Container(
            width: 38,
            height: 38,

            decoration: BoxDecoration(
              color:
                  AppColors.primaryLight,
              borderRadius:
                  BorderRadius.circular(
                11,
              ),
            ),

            child: Icon(
              icon,
              size: 18,
              color:
                  AppColors.primaryColor,
            ),
          ),

          const SizedBox(
            width: 12,
          ),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,

              children: [
                Text(
                  label,
                  style:
                      const TextStyle(
                    fontSize: 11,
                    color: AppColors
                        .subtitleColor,
                  ),
                ),

                const SizedBox(
                  height: 4,
                ),

                valueWidget ??
                    Text(
                      value.isEmpty
                          ? 'Not provided'
                          : value,
                      style:
                          const TextStyle(
                        fontSize: 14,
                        fontWeight:
                            FontWeight
                                .w700,
                        color: AppColors
                            .titleColor,
                      ),
                    ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // DETAIL DIVIDER
  // ------------------------------------------------------------

  Widget _detailDivider() {
    return Divider(
      height: 1,
      color:
          Colors.grey.withValues(alpha: 0.10),
    );
  }

  // ------------------------------------------------------------
  // STATUS BADGE
  // ------------------------------------------------------------

  Widget _statusBadge() {
    return Container(
      padding:
          const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 5,
      ),

      decoration: BoxDecoration(
        color: Colors.green
            .withValues(alpha: 0.10),
        borderRadius:
            BorderRadius.circular(20),
      ),

      child: Row(
        mainAxisSize:
            MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,

            decoration:
                const BoxDecoration(
              color: Colors.green,
              shape: BoxShape.circle,
            ),
          ),

          const SizedBox(
            width: 6,
          ),

          Text(
            status,
            style:
                const TextStyle(
              fontSize: 11,
              fontWeight:
                  FontWeight.w800,
              color: Colors.green,
            ),
          ),
        ],
      ),
    );
  }
}