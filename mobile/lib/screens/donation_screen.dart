import 'dart:io';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../constants/app_colors.dart';
import '../services/api_service.dart';
import '../widgets/app_drawer.dart';
import 'donation_history_screen.dart';

class DonationScreen extends StatefulWidget {
  const DonationScreen({super.key});

  @override
  State<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends State<DonationScreen> {
  final amount = TextEditingController();
  final notes = TextEditingController();
  final picker = ImagePicker();

  XFile? proof;

  String method = 'GCash';
  String destination = 'General Fund';

  bool loading = false;
  String userName = 'Anonymous';
  String email = '';

  final methods = const [
    'QR Ph (InstaPay)',
    'GCash',
    'Maya',
    'Bank Transfer',
  ];

  final destinations = const [
    'General Fund',
    'Community Assistance',
    'Charitable Support',
  ];

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  @override
  void dispose() {
    amount.dispose();
    notes.dispose();
    super.dispose();
  }

  Future<void> _loadUser() async {
    try {
      final result = await ApiService().getUserProfile();

      if (!mounted) return;

      if (result['success'] == true && result['data'] != null) {
        setState(() {
          userName =
              result['data']['name']?.toString() ?? 'Anonymous';
          email = result['data']['email']?.toString() ?? '';
        });
      }
    } catch (_) {
      // Keep the screen usable even if the profile request fails.
    }
  }

  Future<void> pickProof() async {
    try {
      final x = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 75,
      );

      if (x != null && mounted) {
        setState(() => proof = x);
      }
    } catch (_) {
      if (!mounted) return;
      _notify(
        'We could not open your image picker. Please try again.',
        error: true,
      );
    }
  }

  double? get amountValue =>
      double.tryParse(amount.text.trim());

  void _notify(String text, {bool error = false}) {
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

  Future<void> confirm() async {
    final value = amountValue;

    if (value == null || value <= 0) {
      _notify(
        'Enter a valid donation amount greater than zero.',
        error: true,
      );
      return;
    }

    if (proof == null) {
      _notify(
        'Please attach your payment proof before submitting.',
        error: true,
      );
      return;
    }

    FocusScope.of(context).unfocus();

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('Confirm donation'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _summaryRow(
              'Amount',
              '₱${value.toStringAsFixed(2)}',
            ),
            _summaryRow('Destination', destination),
            _summaryRow('Payment', method),
            _summaryRow(
              'Notes',
              notes.text.trim().isEmpty
                  ? 'None'
                  : notes.text.trim(),
            ),
            const SizedBox(height: 10),
            const Text(
              'Please make sure the details and uploaded proof are correct.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.subtitleColor,
                height: 1.4,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Review'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm'),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      await _submit(value);
    }
  }

  Future<void> _submit(double value) async {
    if (loading) return;

    setState(() => loading = true);

    final data = {
      'donorName': userName,
      'amount': value,
      'paymentMethod': method,
      'destination': destination,
      'notes': notes.text.trim(),
    };

    try {
      final result = await ApiService().createDonation(data);

      if (!mounted) return;

      if (result['success'] == true) {
        final d = result['data'] ?? result;
        final id = d is Map
            ? (d['_id'] ?? d['id'])?.toString()
            : null;

        if (id != null && proof != null) {
          final bytes = await proof!.readAsBytes();

          final upload = await ApiService().uploadDonationReceipt(
            id,
            proof!.path,
            bytes,
            proof!.name,
          );

          if (!mounted) return;

          if (upload['success'] != true) {
            setState(() => loading = false);
            _notify(
              'Donation saved, but the receipt upload failed. Please contact support if needed.',
              error: true,
            );
            return;
          }
        }

        setState(() => loading = false);

        await _successDialog();

        if (!mounted) return;

        amount.clear();
        notes.clear();
        setState(() => proof = null);

        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => const DonationHistoryScreen(),
          ),
        );
      } else {
        setState(() => loading = false);
        _notify(
          _friendlyError(result['error'] ?? result['message']),
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => loading = false);
      _notify(
        'Unable to connect. Please check your internet connection and try again.',
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
        lower.contains('network is unreachable') ||
        lower.contains('timeout')) {
      return 'Please check your internet connection and try again.';
    }

    if (lower.contains('unauthorized') ||
        lower.contains('token') ||
        lower.contains('login')) {
      return 'Your session may have expired. Please sign in again.';
    }

    if (message.contains('Exception:')) {
      return 'Something went wrong while submitting your donation.';
    }

    return message.isEmpty
        ? 'We could not submit your donation. Please try again.'
        : message;
  }

  Future<void> _successDialog() {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.check_circle_rounded,
              color: AppColors.successColor,
              size: 68,
            ),
            SizedBox(height: 14),
            Text(
              'Donation Submitted',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.titleColor,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Your donation has been successfully recorded and is now available in your donation summary.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: AppColors.subtitleColor,
                height: 1.45,
              ),
            ),
          ],
        ),
        actions: [
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('View Summary'),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 82,
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 12,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: AppColors.titleColor,
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      drawer: AppDrawer(userName: userName, email: email),
      appBar: AppBar(
        title: const Text('Make a Donation'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _header(),
                const SizedBox(height: 16),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const _SectionTitle(
                          title: 'Donation details',
                          subtitle:
                              'Provide the information needed to record your donation.',
                        ),
                        const SizedBox(height: 18),
                        TextField(
                          controller: amount,
                          keyboardType: const TextInputType.numberWithOptions(
                            decimal: true,
                          ),
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(
                              RegExp(r'[0-9.]'),
                            ),
                          ],
                          decoration: const InputDecoration(
                            labelText: 'Donation amount',
                            hintText: '0.00',
                            prefixText: '₱ ',
                            prefixIcon: Icon(Icons.payments_outlined),
                          ),
                        ),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: destination,
                          decoration: const InputDecoration(
                            labelText: 'Donation destination',
                            prefixIcon:
                                Icon(Icons.account_balance_wallet_outlined),
                          ),
                          items: destinations
                              .map(
                                (item) => DropdownMenuItem(
                                  value: item,
                                  child: Text(item),
                                ),
                              )
                              .toList(),
                          onChanged: loading
                              ? null
                              : (value) {
                                  if (value != null) {
                                    setState(() => destination = value);
                                  }
                                },
                        ),
                        const SizedBox(height: 18),
                        const Text(
                          'Payment method',
                          style: TextStyle(
                            color: AppColors.titleColor,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: methods.map((item) {
                            final selected = method == item;

                            return ChoiceChip(
                              label: Text(item),
                              selected: selected,
                              onSelected: loading
                                  ? null
                                  : (_) =>
                                      setState(() => method = item),
                              selectedColor: AppColors.primaryColor,
                              backgroundColor: Colors.white,
                              side: const BorderSide(
                                color: AppColors.dividerColor,
                              ),
                              labelStyle: TextStyle(
                                color: selected
                                    ? Colors.white
                                    : AppColors.titleColor,
                                fontWeight: FontWeight.w600,
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 14),
                        _paymentInfo(),
                        const SizedBox(height: 18),
                        const Text(
                          'Payment proof',
                          style: TextStyle(
                            color: AppColors.titleColor,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 8),
                        OutlinedButton.icon(
                          onPressed: loading ? null : pickProof,
                          icon: const Icon(Icons.upload_file_rounded),
                          label: Text(
                            proof == null
                                ? 'Attach payment proof'
                                : 'Change payment proof',
                          ),
                        ),
                        if (proof != null) _proofPreview(),
                        const SizedBox(height: 16),
                        TextField(
                          controller: notes,
                          maxLines: 3,
                          maxLength: 300,
                          decoration: const InputDecoration(
                            labelText: 'Notes (optional)',
                            hintText:
                                'e.g. Donation for community assistance',
                            prefixIcon: Icon(Icons.notes_outlined),
                            alignLabelWithHint: true,
                          ),
                        ),
                        const SizedBox(height: 6),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: loading ? null : confirm,
                            icon: loading
                                ? const SizedBox(
                                    width: 18,
                                    height: 18,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Icon(
                                    Icons.volunteer_activism_rounded,
                                  ),
                            label: Text(
                              loading
                                  ? 'Submitting donation...'
                                  : 'Submit Donation',
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 25),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _header() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.primaryDark, AppColors.primaryColor],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.volunteer_activism_rounded,
            color: Colors.white,
            size: 34,
          ),
          SizedBox(height: 10),
          Text(
            'Make a Donation',
            style: TextStyle(
              color: Colors.white,
              fontSize: 25,
              fontWeight: FontWeight.w900,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'Give securely and keep your payment proof for verification.',
            style: TextStyle(
              color: Colors.white70,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _paymentInfo() {
    String text;

    switch (method) {
      case 'QR Ph (InstaPay)':
        text =
            'Use the available QR Ph/InstaPay payment instructions provided by the organization, then upload your receipt below.';
        break;
      case 'Maya':
        text =
            'Use the available Maya payment instructions provided by the organization, then upload your receipt below.';
        break;
      case 'Bank Transfer':
        text =
            'Use the available bank-transfer instructions provided by the organization, then upload your receipt below.';
        break;
      default:
        text =
            'Use the available GCash payment instructions provided by the organization, then upload your receipt below.';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.surfaceBlue,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: AppColors.dividerColor),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.info_outline_rounded,
            color: AppColors.primaryColor,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 12,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _proofPreview() {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.dividerColor),
        ),
        child: Row(
          children: [
            if (kIsWeb)
              const SizedBox(
                width: 64,
                height: 64,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                  ),
                  child: Icon(
                    Icons.image_rounded,
                    color: AppColors.primaryColor,
                    size: 30,
                  ),
                ),
              )
            else
              ClipRRect(
                borderRadius: BorderRadius.circular(9),
                child: Image.file(
                  File(proof!.path),
                  width: 64,
                  height: 64,
                  fit: BoxFit.cover,
                ),
              ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                proof!.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: AppColors.titleColor,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            IconButton(
              onPressed: loading
                  ? null
                  : () => setState(() => proof = null),
              icon: const Icon(Icons.close_rounded),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  final String subtitle;

  const _SectionTitle({
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 19,
            fontWeight: FontWeight.w800,
            color: AppColors.titleColor,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.subtitleColor,
          ),
        ),
      ],
    );
  }
}
