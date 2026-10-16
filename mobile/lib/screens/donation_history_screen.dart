import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class DonationHistoryScreen extends StatefulWidget {
  final bool isTab;
  final String userName;
  final String email;
  final VoidCallback? onBackToHome;

  const DonationHistoryScreen({
    super.key,
    this.isTab = false,
    this.userName = '',
    this.email = '',
    this.onBackToHome,
  });

  @override
  State<DonationHistoryScreen> createState() =>
      _DonationHistoryScreenState();
}

class _DonationHistoryScreenState
    extends State<DonationHistoryScreen> {
  List<dynamic> donations = [];

  // Loading is used on initial fetch.
  bool loading = true;

  String error = '';

  String userName = '';
  String email = '';
  Timer? _autoRefreshTimer;

  @override
  void initState() {
    super.initState();

    userName = widget.userName;
    email = widget.email;

    // Automatically load donation history when the screen opens.
    load(showSpinner: true);
    _startAutoRefresh();
  }

  @override
  void dispose() {
    _autoRefreshTimer?.cancel();
    super.dispose();
  }

  void _startAutoRefresh() {
    _autoRefreshTimer?.cancel();
    _autoRefreshTimer = Timer.periodic(const Duration(seconds: 5), (_) {
      if (mounted) {
        load(showSpinner: false);
      }
    });
  }

  // ------------------------------------------------------------
  // LOAD DONATION HISTORY
  // ------------------------------------------------------------

  Future<void> load({bool showSpinner = true}) async {
    if (showSpinner && mounted) {
      setState(() {
        loading = true;
        error = '';
      });
    }

    try {
      final prefs =
          await SharedPreferences.getInstance();

      if (userName.isEmpty ||
          userName == 'ReliefLink User') {
        userName =
            prefs.getString('user_name') ??
                widget.userName;
      }

      if (email.isEmpty) {
        email =
            prefs.getString('user_email') ??
                widget.email;
      }

      final api = ApiService();

      // Get current user profile.
      final profile =
          await api.getUserProfile();

      // Get donation history.
      final result =
          await api.getDonationHistory();

      if (!mounted) return;

      if (profile['success'] == true &&
          profile['data'] != null &&
          profile['data'] is Map) {
        final pData =
            profile['data'] as Map;

        userName =
            pData['name']?.toString() ??
                userName;

        email =
            pData['email']?.toString() ??
                email;
      }

      if (result['success'] == true) {
        final rawList =
            result['data'] is List
                ? result['data'] as List
                : <dynamic>[];

        final currentEmail =
            email.trim().toLowerCase();

        final currentName =
            userName.trim().toLowerCase();

        final currentUserId = prefs.getString('user_id') ??
            (profile['data'] is Map
                ? (profile['data']['_id'] ?? profile['data']['id'])?.toString()
                : '') ??
            '';

        donations = rawList.where((item) {
          if (item is! Map) {
            return false;
          }

          final dUserId = (item['userId'] ?? item['user'] ?? '').toString();
          if (currentUserId.isNotEmpty && dUserId.isNotEmpty && dUserId == currentUserId) {
            return true;
          }

          final dEmail = (item['donorEmail'] ?? item['email'] ?? '')
              .toString()
              .trim()
              .toLowerCase();

          final dName = (item['donorName'] ?? '')
              .toString()
              .trim()
              .toLowerCase();

          final isEmailMatch = currentEmail.isNotEmpty &&
              dEmail.isNotEmpty &&
              (dEmail == currentEmail ||
                  currentEmail.contains(dEmail) ||
                  dEmail.contains(currentEmail));

          final isNameMatch = currentName.isNotEmpty &&
              dName.isNotEmpty &&
              (dName == currentName ||
                  currentName.contains(dName) ||
                  dName.contains(currentName));

          if (isEmailMatch || isNameMatch) {
            return true;
          }

          // If donation was logged via PayMongo or anonymously for the logged-in user:
          if (dEmail.isEmpty && (dName.isEmpty || dName == 'anonymous donor' || dName == 'donor')) {
            return true;
          }

          if (currentEmail.isEmpty && currentName.isEmpty) {
            return true;
          }

          return false;
        }).toList();

        // Auto-verify any recent pending PayMongo donations in the list
        for (final item in donations) {
          if (item is! Map) continue;
          final itemStatus = (item['status'] ?? '').toString().toLowerCase();
          final itemMethod = (item['paymentMethod'] ?? '').toString().toLowerCase();
          final session = item['checkoutSessionId']?.toString();
          final id = item['_id']?.toString();
          if (itemStatus == 'pending' &&
              (itemMethod.contains('paymongo') || (session != null && session.isNotEmpty)) &&
              id != null) {
            final createdAtStr = item['createdAt']?.toString();
            if (createdAtStr != null) {
              final dt = DateTime.tryParse(createdAtStr);
              if (dt != null && DateTime.now().difference(dt).inMinutes < 30) {
                ApiService().autoVerifyPayMongoDonation(id).then((checkRes) {
                  if (checkRes['status'] == 'paid' || checkRes['success'] == true) {
                    if (mounted) load(showSpinner: false);
                  }
                }).catchError((_) {});
              }
            }
          }
        }
      } else {
        error = _friendlyError(
          result['error'] ??
              result['message'],
        );
      }

      if (!mounted) return;

      setState(() {
        loading = false;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        loading = false;
        error =
            'Unable to connect. Please check your internet connection and try again.';
      });
    }
  }

  // ------------------------------------------------------------
  // ERROR MESSAGE
  // ------------------------------------------------------------

  String _friendlyError(dynamic value) {
    final message =
        value?.toString() ?? '';

    final lower =
        message.toLowerCase();

    if (lower.contains('socketexception') ||
        lower.contains('connection refused') ||
        lower.contains('failed host lookup') ||
        lower.contains('network is unreachable') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong while loading your donations.';
    }

    return message.isEmpty
        ? 'Unable to load your donation summary.'
        : message;
  }

  // ------------------------------------------------------------
  // NUMBER FORMAT
  // ------------------------------------------------------------

  double _number(dynamic value) {
    return value is num
        ? value.toDouble()
        : double.tryParse(
              value?.toString() ?? '',
            ) ??
            0;
  }

  String _money(dynamic value) {
    return '₱${_number(value).abs().toStringAsFixed(2)}';
  }

  // ------------------------------------------------------------
  // DATE FORMAT
  // ------------------------------------------------------------

  String _date(dynamic value) {
    if (value == null) {
      return 'N/A';
    }

    try {
      final date =
          DateTime.parse(value.toString()).toLocal();

      final hour = date.hour == 0 ? 12 : (date.hour > 12 ? date.hour - 12 : date.hour);
      final amPm = date.hour >= 12 ? 'PM' : 'AM';
      final minute = date.minute.toString().padLeft(2, '0');

      return '${date.month}/${date.day}/${date.year} • $hour:$minute $amPm';
    } catch (_) {
      return value
          .toString()
          .split('T')
          .first;
    }
  }

  // ------------------------------------------------------------
  // STATUS COLOR
  // ------------------------------------------------------------

  Color _statusColor(
    String status, [
    dynamic donation,
  ]) {
    final value =
        status.toLowerCase();

    // Check if pending but older than 30 minutes
    if (donation != null) {
      final createdAtStr = donation['createdAt']?.toString();
      if (createdAtStr != null && createdAtStr.isNotEmpty) {
        final dt = DateTime.tryParse(createdAtStr);
        if (dt != null && DateTime.now().difference(dt).inMinutes >= 30) {
          if (value == 'pending') {
            return const Color(0xFF94A3B8);
          }
        }
      }
    }

    if (value.contains('partially used')) {
      return AppColors.primaryColor;
    }

    if (value.contains('fully used')) {
      return const Color(0xFF64748B);
    }

    if (value.contains('cash on hand') ||
        value.contains('approved') ||
        value.contains('complete') ||
        value.contains('validated') ||
        value.contains('verified')) {
      return AppColors.successColor;
    }

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel') ||
        value.contains('uncompleted') ||
        value.contains('expired')) {
      return const Color(0xFF94A3B8);
    }

    return AppColors.warningColor;
  }

  // ------------------------------------------------------------
  // STATUS LABEL
  // ------------------------------------------------------------

  String _statusLabel(
    String status, [
    dynamic donation,
  ]) {
    final value =
        status.toLowerCase();

    // Check if pending but older than 30 minutes
    if (donation != null) {
      final createdAtStr = donation['createdAt']?.toString();
      if (createdAtStr != null && createdAtStr.isNotEmpty) {
        final dt = DateTime.tryParse(createdAtStr);
        if (dt != null && DateTime.now().difference(dt).inMinutes >= 30) {
          if (value == 'pending') {
            return 'Uncompleted';
          }
        }
      }
    }

    if (value.contains('partially used')) {
      return 'Partially Used';
    }

    if (value.contains('fully used')) {
      return 'Fully Used';
    }

    if (value.contains('cash on hand')) {
      return 'Cash on Hand';
    }

    if (value.contains('approved') ||
        value.contains('complete') ||
        value.contains('validated') ||
        value.contains('verified')) {
      return 'Cash on Hand';
    }

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel') ||
        value.contains('uncompleted') ||
        value.contains('expired')) {
      return 'Uncompleted';
    }

    return 'Pending';
  }

  // ------------------------------------------------------------
  // BUILD
  // ------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final approvedDonations =
        donations.where((donation) {
      final rawStatus =
          (donation[
                      'verificationStatus'] ??
                  donation['status'] ??
                  '')
              .toString()
              .toLowerCase();

      return !rawStatus.contains('reject') &&
          !rawStatus.contains('pending');
    }).toList();

    final approvedTotal =
        approvedDonations.fold<double>(
      0,
      (sum, donation) =>
          sum +
          _number(
            donation['amount'],
          ).abs(),
    );

    return Scaffold(
      backgroundColor:
          AppColors.backgroundColor,

      appBar: AppBar(
        automaticallyImplyLeading:
            false,

        leading: IconButton(
          icon: const Icon(
            Icons
                .arrow_back_ios_new_rounded,
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
          'Donation Summary',
          style: TextStyle(
            fontWeight: FontWeight.w800,
          ),
        ),

        // No refresh icon here.
        // Donation history loads automatically.
      ),

      body: RefreshIndicator(
        onRefresh: load,
        color: AppColors.primaryColor,

        child: loading
            ? const Center(
                child:
                    CircularProgressIndicator(),
              )
            : error.isNotEmpty
                ? _errorState()
                : donations.isEmpty
                    ? _emptyState()
                    : ListView(
                        physics:
                            const AlwaysScrollableScrollPhysics(),

                        padding:
                            const EdgeInsets.fromLTRB(
                          18,
                          18,
                          18,
                          30,
                        ),

                        children: [
                          _overview(
                            approvedTotal,
                            approvedDonations
                                .length,
                          ),

                          const SizedBox(
                            height: 18,
                          ),

                          const Text(
                            'Your donations',
                            style:
                                TextStyle(
                              fontSize: 19,
                              fontWeight:
                                  FontWeight
                                      .w800,
                              color: AppColors
                                  .titleColor,
                            ),
                          ),

                          const SizedBox(
                            height: 10,
                          ),

                          ...donations
                              .map(_card),
                        ],
                      ),
      ),
    );
  }

  // ------------------------------------------------------------
  // DONATION OVERVIEW
  // ------------------------------------------------------------

  Widget _overview(
    double approvedTotal,
    int approvedCount,
  ) {
    return Container(
      width: double.infinity,

      padding:
          const EdgeInsets.all(20),

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
            BorderRadius.circular(22),
      ),

      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,

            decoration: BoxDecoration(
              color: Colors.white
                  .withValues(
                alpha: .14,
              ),
              borderRadius:
                  BorderRadius.circular(
                15,
              ),
            ),

            child: const Icon(
              Icons
                  .volunteer_activism_rounded,
              color: Colors.white,
              size: 27,
            ),
          ),

          const SizedBox(
            width: 14,
          ),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,

              children: [
                const Text(
                  'TOTAL DONATED',
                  style: TextStyle(
                    color:
                        Colors.white70,
                    fontSize: 10,
                    fontWeight:
                        FontWeight.w800,
                    letterSpacing: 1,
                  ),
                ),

                const SizedBox(
                  height: 3,
                ),

                Text(
                  '₱${approvedTotal.toStringAsFixed(2)}',
                  style:
                      const TextStyle(
                    color: Colors.white,
                    fontSize: 25,
                    fontWeight:
                        FontWeight.w900,
                  ),
                ),

                const SizedBox(
                  height: 2,
                ),

                Text(
                  '$approvedCount verified transaction${approvedCount == 1 ? '' : 's'}',
                  style:
                      const TextStyle(
                    color:
                        Colors.white70,
                    fontSize: 11,
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
  // DONATION CARD
  // ------------------------------------------------------------

  Widget _card(
    dynamic donation,
  ) {
    final status =
        (donation[
                    'verificationStatus'] ??
                donation['status'] ??
                'pending')
            .toString();

    final color =
        _statusColor(status, donation);

    final label =
        _statusLabel(status, donation);

    final blockId =
        donation['blockId']
                ?.toString() ??
            '';

    return Card(
      margin:
          const EdgeInsets.only(
        bottom: 12,
      ),

      child: Padding(
        padding:
            const EdgeInsets.all(18),

        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment
                  .start,

          children: [
            Row(
              children: [
                Container(
                  width: 46,
                  height: 46,

                  decoration:
                      BoxDecoration(
                    color: AppColors
                        .primaryLight,
                    borderRadius:
                        BorderRadius
                            .circular(
                      14,
                    ),
                  ),

                  child: const Icon(
                    Icons
                        .receipt_long_rounded,
                    color: AppColors
                        .primaryColor,
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
                        _money(
                          donation[
                              'amount'],
                        ),
                        style:
                            const TextStyle(
                          fontSize: 20,
                          fontWeight:
                              FontWeight
                                  .w900,
                          color: AppColors
                              .titleColor,
                        ),
                      ),

                      const SizedBox(
                        height: 3,
                      ),

                      Text(
                        (donation[
                                    'destination'] ??
                                'General Fund')
                            .toString(),

                        maxLines: 1,

                        overflow:
                            TextOverflow
                                .ellipsis,

                        style:
                            const TextStyle(
                          color: AppColors
                              .subtitleColor,
                        ),
                      ),
                    ],
                  ),
                ),

                _badge(
                  label,
                  color,
                ),
              ],
            ),

            const Divider(
              height: 28,
            ),

            _row(
              Icons
                  .payments_outlined,
              'Payment method',
              donation[
                      'paymentMethod'] ??
                  'N/A',
            ),

            _row(
              Icons
                  .calendar_today_outlined,
              'Date',
              _date(
                donation[
                    'createdAt'],
              ),
            ),

            _row(
              Icons.tag_outlined,
              'Reference',
              donation[
                      'referenceNumber'] ??
                  'N/A',
            ),

            _row(
              Icons
                  .verified_outlined,
              'Status',
              label,
            ),

            _row(
              Icons
                  .account_balance_wallet_outlined,
              'Remaining balance',
              _money(
                label == 'Partially Used'
                    ? (donation['remainingBalance'] is num
                        ? (donation['remainingBalance'] as num).toDouble()
                        : (double.tryParse(donation['remainingBalance']?.toString() ?? '') ??
                            (_number(donation['amount']) * 0.5)))
                    : 0,
              ),
            ),

            if (donation['usageLogs'] is List &&
                (donation['usageLogs'] as List).isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: label == 'Partially Used'
                        ? const Color(0xFFBFDBFE)
                        : const Color(0xFFE2E8F0),
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.event_available_rounded,
                          size: 16,
                          color: label == 'Partially Used'
                              ? AppColors.primaryColor
                              : const Color(0xFF475569),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'RELIEF EVENT UTILIZATION',
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: label == 'Partially Used'
                                ? AppColors.primaryColor
                                : const Color(0xFF334155),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ...(donation['usageLogs'] as List).map((logItem) {
                      if (logItem is! Map) return const SizedBox.shrink();
                      final purpose = (logItem['purpose'] ??
                              donation['destination'] ??
                              'Parish Aid')
                          .toString();
                      final amt = _money(logItem['amount']);
                      final logDate = _date(logItem['date']);
                      final notes = (logItem['notes'] ?? '').toString();
                      final balAfter = logItem['balanceAfter'];

                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: const Color(0xFFE2E8F0),
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Text(
                                    purpose,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 12.5,
                                      color: Color(0xFF0F172A),
                                    ),
                                  ),
                                ),
                                Text(
                                  '-$amt',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 12.5,
                                    color: Color(0xFFDC2626),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Row(
                              mainAxisAlignment:
                                  MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  logDate,
                                  style: const TextStyle(
                                    fontSize: 10.5,
                                    color: Color(0xFF64748B),
                                  ),
                                ),
                                if (balAfter != null)
                                  Text(
                                    'Balance: ${_money(balAfter)}',
                                    style: const TextStyle(
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w700,
                                      color: Color(0xFF16A34A),
                                    ),
                                  ),
                              ],
                            ),
                            if (notes.isNotEmpty) ...[
                              const SizedBox(height: 4),
                              Text(
                                notes,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF475569),
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ],
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ] else if (label == 'Partially Used') ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEFF6FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: const Color(0xFFBFDBFE),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.info_outline_rounded,
                      size: 16,
                      color: Color(0xFF2563EB),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'This donation has been partially disbursed for ${(donation['destination'] ?? 'parish disaster relief')}. Remaining: ${_money(donation['remainingBalance'] ?? (_number(donation['amount']) * 0.5))}',
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: Color(0xFF1E40AF),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (label == 'Fully Used') ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFF8FAFC),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: const Color(0xFFCBD5E1),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.task_alt_rounded,
                      size: 16,
                      color: Color(0xFF475569),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '100% of this contribution was fully utilized for ${(donation['destination'] ?? 'parish disaster relief operations')}.',
                        style: const TextStyle(
                          fontSize: 11.5,
                          color: Color(0xFF334155),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ] else if (label == 'Cash on Hand') ...[
              const SizedBox(height: 10),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFFECFDF5),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: const Color(0xFFA7F3D0),
                  ),
                ),
                child: Row(
                  children: const [
                    Icon(
                      Icons.shield_outlined,
                      size: 16,
                      color: Color(0xFF16A34A),
                    ),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '100% Cash on Hand. Secured in parish treasury, ready for upcoming relief events.',
                        style: TextStyle(
                          fontSize: 11,
                          color: Color(0xFF166534),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            if (blockId.isNotEmpty) ...[
              const SizedBox(
                height: 7,
              ),
              _blockchain(
                blockId,
              ),
            ],
          ],
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // INFORMATION ROW
  // ------------------------------------------------------------

  Widget _row(
    IconData icon,
    String label,
    dynamic value,
  ) {
    return Padding(
      padding:
          const EdgeInsets.only(
        bottom: 10,
      ),

      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment
                .start,

        children: [
          Icon(
            icon,
            size: 18,
            color: AppColors
                .primaryColor,
          ),

          const SizedBox(
            width: 9,
          ),

          SizedBox(
            width: 110,

            child: Text(
              label,
              style:
                  const TextStyle(
                fontSize: 11,
                color: AppColors
                    .subtitleColor,
              ),
            ),
          ),

          Expanded(
            child: Text(
              value.toString(),
              style:
                  const TextStyle(
                fontSize: 12,
                color:
                    AppColors
                        .titleColor,
                fontWeight:
                    FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // STATUS BADGE
  // ------------------------------------------------------------

  Widget _badge(
    String label,
    Color color,
  ) {
    return Container(
      padding:
          const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 6,
      ),

      decoration:
          BoxDecoration(
        color: color.withValues(
          alpha: .10,
        ),
        borderRadius:
            BorderRadius.circular(
          20,
        ),
      ),

      child: Text(
        label.toUpperCase(),

        style: TextStyle(
          fontSize: 9,
          fontWeight:
              FontWeight.w800,
          color: color,
        ),
      ),
    );
  }

  // ------------------------------------------------------------
  // BLOCKCHAIN INFORMATION
  // ------------------------------------------------------------

  Widget _blockchain(
    String blockId,
  ) {
    return Container(
      width: double.infinity,

      padding:
          const EdgeInsets.all(13),

      decoration: BoxDecoration(
        color:
            AppColors.surfaceBlue,
        borderRadius:
            BorderRadius.circular(
          14,
        ),
        border: Border.all(
          color:
              AppColors.dividerColor,
        ),
      ),

      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment
                .start,

        children: [
          const Icon(
            Icons.link_rounded,
            color:
                AppColors.primaryColor,
            size: 19,
          ),

          const SizedBox(
            width: 8,
          ),

          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment
                      .start,

              children: [
                const Text(
                  'Blockchain information',
                  style:
                      TextStyle(
                    fontSize: 11,
                    color: AppColors
                        .primaryDark,
                    fontWeight:
                        FontWeight
                            .w800,
                  ),
                ),

                const SizedBox(
                  height: 4,
                ),

                Text(
                  blockId,
                  maxLines: 3,
                  overflow:
                      TextOverflow
                          .ellipsis,

                  style:
                      const TextStyle(
                    fontSize: 10,
                    color: AppColors
                        .subtitleColor,
                    fontFamily:
                        'monospace',
                  ),
                ),
              ],
            ),
          ),

          IconButton(
            tooltip:
                'Copy hash',

            onPressed: () {
              Clipboard.setData(
                ClipboardData(
                  text: blockId,
                ),
              );

              ScaffoldMessenger
                  .of(context)
                  .showSnackBar(
                const SnackBar(
                  content: Text(
                    'Blockchain information copied.',
                  ),
                ),
              );
            },

            icon: const Icon(
              Icons.copy_outlined,
              size: 18,
              color:
                  AppColors
                      .primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  // ------------------------------------------------------------
  // EMPTY STATE
  // ------------------------------------------------------------

  Widget _emptyState() {
    return ListView(
      physics:
          const AlwaysScrollableScrollPhysics(),

      children: [
        SizedBox(
          height:
              MediaQuery.of(context)
                      .size
                      .height *
                  .22,
        ),

        Center(
          child: Padding(
            padding:
                const EdgeInsets.all(
              24,
            ),

            child: Column(
              children: [
                Container(
                  width: 82,
                  height: 82,

                  decoration:
                      const BoxDecoration(
                    color: AppColors
                        .primaryLight,
                    shape:
                        BoxShape.circle,
                  ),

                  child: const Icon(
                    Icons
                        .receipt_long_outlined,
                    color: AppColors
                        .primaryColor,
                    size: 38,
                  ),
                ),

                const SizedBox(
                  height: 14,
                ),

                const Text(
                  'No donations yet',
                  style:
                      TextStyle(
                    fontSize: 18,
                    fontWeight:
                        FontWeight
                            .w800,
                    color: AppColors
                        .titleColor,
                  ),
                ),

                const SizedBox(
                  height: 5,
                ),

                const Text(
                  'Your donation transactions will appear here after you make a donation.',
                  textAlign:
                      TextAlign.center,
                  style:
                      TextStyle(
                    color: AppColors
                        .subtitleColor,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ------------------------------------------------------------
  // ERROR STATE
  // ------------------------------------------------------------

  Widget _errorState() {
    return ListView(
      physics:
          const AlwaysScrollableScrollPhysics(),

      children: [
        SizedBox(
          height:
              MediaQuery.of(context)
                      .size
                      .height *
                  .22,
        ),

        Center(
          child: Padding(
            padding:
                const EdgeInsets.all(
              24,
            ),

            child: Column(
              children: [
                const Icon(
                  Icons
                      .cloud_off_rounded,
                  size: 52,
                  color: AppColors
                      .subtitleColor,
                ),

                const SizedBox(
                  height: 12,
                ),

                Text(
                  error,
                  textAlign:
                      TextAlign.center,

                  style:
                      const TextStyle(
                    color: AppColors
                        .titleColor,
                  ),
                ),

                const SizedBox(
                  height: 14,
                ),

                // Retry is only shown when
                // loading failed.
                ElevatedButton.icon(
                  onPressed: load,

                  icon: const Icon(
                    Icons
                        .refresh_rounded,
                  ),

                  label: const Text(
                    'Try again',
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}