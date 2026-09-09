import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';

class DonationHistoryScreen extends StatefulWidget {
  final bool isTab;

  const DonationHistoryScreen({
    super.key,
    this.isTab = false,
  });

  @override
  State<DonationHistoryScreen> createState() =>
      _DonationHistoryScreenState();
}

class _DonationHistoryScreenState extends State<DonationHistoryScreen> {
  List<dynamic> donations = [];

  bool loading = true;
  String error = '';

  String userName = 'ReliefLink User';
  String email = '';

  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    setState(() {
      loading = true;
      error = '';
    });

    try {
      final api = ApiService();
      final profile = await api.getUserProfile();
      final result = await api.getDonationHistory();

      if (!mounted) return;

      if (profile['success'] == true && profile['data'] != null) {
        userName =
            profile['data']['name']?.toString() ?? userName;
        email =
            profile['data']['email']?.toString() ?? email;
      }

      if (result['success'] == true) {
        donations = result['data'] is List ? result['data'] : [];
      } else {
        error = _friendlyError(
          result['error'] ?? result['message'],
        );
      }

      setState(() => loading = false);
    } catch (_) {
      if (!mounted) return;

      setState(() {
        loading = false;
        error =
            'Unable to connect. Please check your internet connection and try again.';
      });
    }
  }

  String _friendlyError(dynamic value) {
    final message = value?.toString() ?? '';
    final lower = message.toLowerCase();

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

  double _number(dynamic value) {
    return value is num
        ? value.toDouble()
        : double.tryParse(value?.toString() ?? '') ?? 0;
  }

  String _money(dynamic value) {
    return '₱${_number(value).abs().toStringAsFixed(2)}';
  }

  String _date(dynamic value) {
    if (value == null) return 'N/A';

    try {
      final date = DateTime.parse(value.toString());
      return '${date.month}/${date.day}/${date.year}';
    } catch (_) {
      return value.toString().split('T').first;
    }
  }

  Color _statusColor(String status) {
    final value = status.toLowerCase();

    if (value.contains('approved') ||
        value.contains('complete') ||
        value.contains('validated') ||
        value.contains('verified')) {
      return AppColors.successColor;
    }

    if (value.contains('reject') ||
        value.contains('fail') ||
        value.contains('cancel')) {
      return AppColors.errorColor;
    }

    return AppColors.warningColor;
  }

  String _statusLabel(String status) {
    final value = status.toLowerCase();

    if (value.contains('approved') ||
        value.contains('complete') ||
        value.contains('validated') ||
        value.contains('verified')) {
      return 'Approved';
    }

    if (value.contains('reject') || value.contains('fail')) {
      return 'Rejected';
    }

    return 'Pending';
  }

  @override
  Widget build(BuildContext context) {
    final approvedDonations = donations.where((donation) {
      final rawStatus = (donation['verificationStatus'] ?? donation['status'] ?? '').toString();
      return _statusLabel(rawStatus) == 'Approved';
    }).toList();

    final approvedTotal = approvedDonations.fold<double>(
      0,
      (sum, donation) => sum + _number(donation['amount']).abs(),
    );

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      drawer: widget.isTab
          ? null
          : AppDrawer(
              userName: userName,
              email: email,
            ),
      appBar: AppBar(
        automaticallyImplyLeading: !widget.isTab,
        title: const Text('Donation Summary'),
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
            : error.isNotEmpty
                ? _errorState()
                : donations.isEmpty
                    ? _emptyState()
                    : ListView(
                        physics:
                            const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.fromLTRB(
                          18,
                          18,
                          18,
                          30,
                        ),
                        children: [
                          _overview(approvedTotal, approvedDonations.length),
                          const SizedBox(height: 18),
                          const Text(
                            'Your donations',
                            style: TextStyle(
                              fontSize: 19,
                              fontWeight: FontWeight.w800,
                              color: AppColors.titleColor,
                            ),
                          ),
                          const SizedBox(height: 10),
                          ...donations.map(_card),
                        ],
                      ),
      ),
    );
  }

  Widget _overview(double approvedTotal, int approvedCount) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .14),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(
              Icons.volunteer_activism_rounded,
              color: Colors.white,
              size: 27,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'TOTAL DONATED',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '₱${approvedTotal.toStringAsFixed(2)}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 25,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '$approvedCount verified transaction${approvedCount == 1 ? '' : 's'}',
                  style: const TextStyle(
                    color: Colors.white70,
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

  Widget _card(dynamic donation) {
    final status =
        (donation['verificationStatus'] ??
                donation['status'] ??
                'pending')
            .toString();

    final color = _statusColor(status);
    final label = _statusLabel(status);

    final blockId =
        donation['blockId']?.toString() ?? '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: const Icon(
                    Icons.receipt_long_rounded,
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
                        _money(donation['amount']),
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: AppColors.titleColor,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        (donation['destination'] ??
                                'General Fund')
                            .toString(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.subtitleColor,
                        ),
                      ),
                    ],
                  ),
                ),
                _badge(label, color),
              ],
            ),
            const Divider(height: 28),
            _row(
              Icons.payments_outlined,
              'Payment method',
              donation['paymentMethod'] ?? 'N/A',
            ),
            _row(
              Icons.calendar_today_outlined,
              'Date',
              _date(donation['createdAt']),
            ),
            _row(
              Icons.tag_outlined,
              'Reference',
              donation['referenceNumber'] ?? 'N/A',
            ),
            _row(
              Icons.verified_outlined,
              'Verification',
              label,
            ),
            if (blockId.isNotEmpty) ...[
              const SizedBox(height: 7),
              _blockchain(blockId),
            ],
          ],
        ),
      ),
    );
  }

  Widget _row(
    IconData icon,
    String label,
    dynamic value,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            size: 18,
            color: AppColors.primaryColor,
          ),
          const SizedBox(width: 9),
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.subtitleColor,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value.toString(),
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.titleColor,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .10),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        label.toUpperCase(),
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w800,
          color: color,
        ),
      ),
    );
  }

  Widget _blockchain(String blockId) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.surfaceBlue,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.dividerColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.link_rounded,
            color: AppColors.primaryColor,
            size: 19,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Blockchain information',
                  style: TextStyle(
                    fontSize: 11,
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  blockId,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.subtitleColor,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Copy hash',
            onPressed: () {
              Clipboard.setData(
                ClipboardData(text: blockId),
              );
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Blockchain information copied.'),
                ),
              );
            },
            icon: const Icon(
              Icons.copy_outlined,
              size: 18,
              color: AppColors.primaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * .22,
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                Container(
                  width: 82,
                  height: 82,
                  decoration: const BoxDecoration(
                    color: AppColors.primaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.receipt_long_outlined,
                    color: AppColors.primaryColor,
                    size: 38,
                  ),
                ),
                const SizedBox(height: 14),
                const Text(
                  'No donations yet',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
                const SizedBox(height: 5),
                const Text(
                  'Your donation transactions will appear here after you make a donation.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.subtitleColor,
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

  Widget _errorState() {
    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      children: [
        SizedBox(
          height: MediaQuery.of(context).size.height * .22,
        ),
        Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                const Icon(
                  Icons.cloud_off_rounded,
                  size: 52,
                  color: AppColors.subtitleColor,
                ),
                const SizedBox(height: 12),
                Text(
                  error,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: AppColors.titleColor,
                  ),
                ),
                const SizedBox(height: 14),
                ElevatedButton.icon(
                  onPressed: load,
                  icon: const Icon(Icons.refresh_rounded),
                  label: const Text('Try again'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
