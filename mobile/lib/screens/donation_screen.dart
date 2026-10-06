import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/app_colors.dart';
import '../services/api_service.dart';

class DonationScreen extends StatefulWidget {
  final bool isTab;
  final VoidCallback? onBackToHome;
  final VoidCallback? onDonationSuccess;

  const DonationScreen({
    super.key,
    this.isTab = false,
    this.onBackToHome,
    this.onDonationSuccess,
  });

  @override
  State<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends State<DonationScreen> {
  final ApiService _apiService = ApiService();

  final TextEditingController amount = TextEditingController();
  final TextEditingController notes = TextEditingController();

  String method = 'QRPH PayMongo';
  String destination = 'Parish General Fund';

  bool loading = false;

  final List<String> destinations = [
    'Parish General Fund',
    'LGBTQ',
    'Elderly',
    'PDL (nakakolong)',
    'Urban Poor',
    'Migrant',
    'Student Scholarships',
    'Drug rehabilitation.',
  ];

  final Map<String, String> destinationDescriptions = {
    'Parish General Fund':
        'Supports the church\'s general programs, services, and community needs.',
    'Disaster Relief':
        'Provides assistance and relief support during emergencies and disasters.',
    'Senior Citizens':
        'Supports programs and assistance for elderly members of the community.',
    'Scholars':
        'Helps provide educational support and assistance to deserving students.',
    'Prison Ministry':
        'Supports outreach, care, and assistance for persons in correctional facilities.',
    'Persons with Disabilities (PWD)':
        'Supports programs and assistance for persons with disabilities.',
    'Solo Parents':
        'Provides support and assistance to solo parents and their families.',
  };

  @override
  void dispose() {
    amount.dispose();
    notes.dispose();
    super.dispose();
  }

  double get amountValue {
    final cleaned = amount.text.replaceAll(',', '');
    return double.tryParse(cleaned) ?? 0;
  }

  String _formatAmount(double value) {
    return value.toStringAsFixed(2).replaceAllMapped(
          RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
          (match) => '${match.group(1)},',
        );
  }

  void _setAmount(double value) {
    amount.text = value.toStringAsFixed(0);
    amount.selection = TextSelection.fromPosition(
      TextPosition(offset: amount.text.length),
    );

    setState(() {});
  }

  Future<void> _confirmDonation() async {
    final value = amountValue;

    if (value <= 0) {
      _showMessage(
        'Please enter a donation amount.',
        isError: true,
      );
      return;
    }

    if (value < 20) {
      _showMessage(
        'The minimum donation amount is ₱20.',
        isError: true,
      );
      return;
    }

    await showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          title: const Text(
            'Review Donation',
            style: TextStyle(
              fontWeight: FontWeight.w700,
            ),
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _reviewRow(
                  'Amount',
                  '₱${_formatAmount(value)}',
                ),
                const SizedBox(height: 12),
                _reviewRow(
                  'Purpose',
                  destination,
                ),
                const SizedBox(height: 12),
                _reviewRow(
                  'Payment',
                  method,
                ),
                if (notes.text.trim().isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _reviewRow(
                    'Note',
                    notes.text.trim(),
                  ),
                ],
                const SizedBox(height: 18),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor.withOpacity(0.07),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.lock_outline_rounded,
                        size: 18,
                        color: AppColors.primaryColor,
                      ),
                      const SizedBox(width: 9),
                      Expanded(
                        child: Text(
                          'You will be redirected to the secure PayMongo checkout to complete your payment.',
                          style: TextStyle(
                            fontSize: 12,
                            height: 1.4,
                            color: AppColors.subtitleColor,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          actionsPadding: const EdgeInsets.fromLTRB(
            18,
            0,
            18,
            16,
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(dialogContext);
                _submit();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryColor,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                'Continue',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> _submit() async {
    if (loading) return;

    FocusScope.of(context).unfocus();

    setState(() {
      loading = true;
    });

    try {
      final donationData = {
        'amount': amountValue,
        'paymentMethod': method,
        'destination': destination,
        'notes': notes.text.trim(),
      };

      if (method == 'QRPH PayMongo') {
        final response = await _apiService.createPayMongoCheckout(
          donationData,
        );

        final checkoutUrl = response['checkoutUrl']?.toString();
        final donationId = response['donationId']?.toString();

        if (checkoutUrl == null || checkoutUrl.isEmpty) {
          throw Exception(
            'Unable to create the PayMongo checkout session.',
          );
        }

        if (donationId == null || donationId.isEmpty) {
          throw Exception(
            'Donation ID was not returned by the server.',
          );
        }

        final uri = Uri.tryParse(checkoutUrl);

        if (uri == null) {
          throw Exception(
            'Invalid PayMongo checkout URL.',
          );
        }

        if (mounted) {
          setState(() {
            loading = false;
          });
        }

        await _showPaymentWaitingDialog(
          checkoutUri: uri,
          donationId: donationId,
        );
      } else {
        await _apiService.createDonation(donationData);

        if (!mounted) return;

        setState(() {
          loading = false;
        });

        await _showSuccessDialog();
      }
    } catch (e) {
      if (!mounted) return;

      setState(() {
        loading = false;
      });

      _showMessage(
        _friendlyError(e),
        isError: true,
      );
    }
  }

  Future<void> _showPaymentWaitingDialog({
    required Uri checkoutUri,
    required String donationId,
  }) async {
    bool dialogOpen = true;
    bool checkoutOpened = false;

    Future<void> openCheckout() async {
      if (checkoutOpened) return;

      checkoutOpened = true;

      try {
        final launched = await launchUrl(
          checkoutUri,
          mode: LaunchMode.externalApplication,
        );

        if (!launched) {
          checkoutOpened = false;

          if (mounted && dialogOpen) {
            _showMessage(
              'Unable to open the payment page. Please try again.',
              isError: true,
            );
          }
        }
      } catch (_) {
        checkoutOpened = false;

        if (mounted && dialogOpen) {
          _showMessage(
            'Unable to open the payment page. Please try again.',
            isError: true,
          );
        }
      }
    }

    if (!mounted) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return PopScope(
          canPop: false,
          child: AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            title: const Text(
              'Complete Your Payment',
              style: TextStyle(
                fontWeight: FontWeight.w700,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: AppColors.primaryColor.withOpacity(0.08),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.qr_code_2_rounded,
                    size: 34,
                    color: AppColors.primaryColor,
                  ),
                ),
                const SizedBox(height: 18),
                const Text(
                  'A secure PayMongo payment page will open.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                const CircularProgressIndicator(),
                const SizedBox(height: 12),
                Text(
                  'Waiting for payment confirmation...',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.subtitleColor,
                  ),
                ),
                const SizedBox(height: 18),
                OutlinedButton.icon(
                  onPressed: openCheckout,
                  icon: const Icon(
                    Icons.open_in_new_rounded,
                    size: 17,
                  ),
                  label: const Text('Open Payment Page'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primaryColor,
                    side: BorderSide(
                      color: AppColors.primaryColor.withOpacity(0.3),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    Future.delayed(
      const Duration(milliseconds: 500),
      () async {
        if (dialogOpen) {
          await openCheckout();
        }
      },
    );

    while (dialogOpen && mounted) {
      await Future.delayed(
        const Duration(seconds: 3),
      );

      if (!dialogOpen || !mounted) break;

      try {
        final response =
            await _apiService.autoVerifyPayMongoDonation(
          donationId,
        );

        final status =
            response['status']?.toString().toLowerCase().trim();

        if (status == 'success' ||
            status == 'paid' ||
            status == 'completed' ||
            status == 'verified') {
          dialogOpen = false;

          if (mounted) {
            Navigator.of(
              context,
              rootNavigator: true,
            ).pop();

            await _showSuccessDialog();
          }

          break;
        }

        if (status == 'failed' ||
            status == 'cancelled' ||
            status == 'canceled') {
          dialogOpen = false;

          if (mounted) {
            Navigator.of(
              context,
              rootNavigator: true,
            ).pop();

            _showMessage(
              'The payment was cancelled or unsuccessful.',
              isError: true,
            );
          }

          break;
        }
      } catch (_) {
        // Keep checking while payment is still pending.
      }
    }
  }

  Future<void> _showSuccessDialog() async {
    if (!mounted) return;

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(
            horizontal: 24,
          ),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(26),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.12),
                  blurRadius: 30,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(26),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.fromLTRB(
                      24,
                      28,
                      24,
                      26,
                    ),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.primaryColor,
                          AppColors.primaryColor.withOpacity(0.82),
                        ],
                      ),
                    ),
                    child: Column(
                      children: [
                        Container(
                          width: 82,
                          height: 82,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            Icons.check_rounded,
                            size: 48,
                            color: AppColors.primaryColor,
                          ),
                        ),
                        const SizedBox(height: 18),
                        const Text(
                          'Donation Successful!',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 22,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Thank you for making a difference.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      children: [
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: AppColors.primaryColor
                                .withOpacity(0.05),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            children: [
                              Text(
                                'DONATION AMOUNT',
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 1,
                                  color: AppColors.subtitleColor,
                                ),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                '₱${_formatAmount(amountValue)}',
                                style: TextStyle(
                                  fontSize: 30,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primaryColor,
                                ),
                              ),
                              const SizedBox(height: 9),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.verified_rounded,
                                      size: 14,
                                      color: Colors.green,
                                    ),
                                    SizedBox(width: 5),
                                    Text(
                                      'Payment Verified',
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: Colors.green,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.grey.shade50,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: Colors.grey.shade200,
                            ),
                          ),
                          child: Row(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: AppColors.primaryColor
                                      .withOpacity(0.08),
                                  borderRadius:
                                      BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  Icons.volunteer_activism_rounded,
                                  size: 20,
                                  color: AppColors.primaryColor,
                                ),
                              ),
                              const SizedBox(width: 11),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Donation Purpose',
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color:
                                            AppColors.subtitleColor,
                                      ),
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      destination,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 14),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(13),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.check_circle_outline_rounded,
                                size: 19,
                                color: Colors.green,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Your verified donation has been recorded successfully.',
                                  style: TextStyle(
                                    fontSize: 12,
                                    height: 1.4,
                                    color: AppColors.subtitleColor,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          height: 48,
                          child: ElevatedButton(
                            onPressed: () {
                              Navigator.pop(dialogContext);
                              _goToSummary();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor:
                                  AppColors.primaryColor,
                              foregroundColor: Colors.white,
                              elevation: 0,
                              shape: RoundedRectangleBorder(
                                borderRadius:
                                    BorderRadius.circular(13),
                              ),
                            ),
                            child: const Text(
                              'View Donation Summary',
                              style: TextStyle(
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          height: 44,
                          child: TextButton(
                            onPressed: () {
                              Navigator.pop(dialogContext);
                              _goToHome();
                            },
                            style: TextButton.styleFrom(
                              foregroundColor:
                                  AppColors.primaryColor,
                            ),
                            child: const Text(
                              'Done',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  void _goToSummary() {
    amount.clear();
    notes.clear();

    if (widget.onDonationSuccess != null) {
      widget.onDonationSuccess!();
      return;
    }

    if (widget.onBackToHome != null) {
      widget.onBackToHome!();
      return;
    }

    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

  void _goToHome() {
    amount.clear();
    notes.clear();

    if (widget.onBackToHome != null) {
      widget.onBackToHome!();
      return;
    }

    if (Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

  String _friendlyError(Object error) {
    final message = error.toString();

    if (message.contains('SocketException')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (message.contains('TimeoutException')) {
      return 'The request took too long. Please try again.';
    }

    if (message.contains('checkout')) {
      return 'Unable to start the payment. Please try again.';
    }

    if (message.contains('Donation ID')) {
      return 'The donation could not be created properly. Please try again.';
    }

    return message
        .replaceFirst('Exception: ', '')
        .replaceFirst('Error: ', '');
  }

  void _showMessage(
    String message, {
    bool isError = false,
  }) {
    if (!mounted) return;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                isError
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(message),
              ),
            ],
          ),
          behavior: SnackBarBehavior.floating,
          backgroundColor:
              isError ? Colors.red.shade700 : Colors.green.shade700,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
  }

  Widget _reviewRow(
    String label,
    String value,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: AppColors.subtitleColor,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.right,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }

  Widget _sectionTitle(
    String title,
    String subtitle,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: TextStyle(
            fontSize: 12,
            height: 1.4,
            color: AppColors.subtitleColor,
          ),
        ),
      ],
    );
  }

  Widget _header() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              child: InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: _goToHome,
                child: Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.grey.shade200,
                    ),
                  ),
                  child: const Icon(
                    Icons.arrow_back_rounded,
                    size: 21,
                    color: Colors.black87,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 13),
            const Expanded(
              child: Text(
                'Donation',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: Colors.black,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 18),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(17),
          decoration: BoxDecoration(
            color: AppColors.primaryColor.withOpacity(0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.primaryColor.withOpacity(0.08),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.primaryColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.volunteer_activism_rounded,
                  color: Colors.white,
                  size: 22,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Support a Cause',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Your generosity helps support community programs and ministries.',
                      style: TextStyle(
                        fontSize: 11.5,
                        height: 1.4,
                        color: AppColors.subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _amountSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(
          'Donation Amount',
          'Select an amount or enter a value.',
        ),
        const SizedBox(height: 13),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
            ),
          ),
          child: TextField(
            controller: amount,
            keyboardType: const TextInputType.numberWithOptions(
              decimal: true,
            ),
            inputFormatters: [
              FilteringTextInputFormatter.allow(
                RegExp(r'^\d*\.?\d{0,2}'),
              ),
            ],
            onChanged: (_) {
              setState(() {});
            },
            decoration: InputDecoration(
              prefixIcon: Padding(
                padding: const EdgeInsets.only(
                  left: 16,
                  right: 8,
                ),
                child: Text(
                  '₱',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryColor,
                  ),
                ),
              ),
              prefixIconConstraints: const BoxConstraints(
                minWidth: 0,
                minHeight: 0,
              ),
              hintText: '0.00',
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 17,
              ),
            ),
          ),
        ),
        const SizedBox(height: 11),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _quickAmountChip(20),
            _quickAmountChip(100),
            _quickAmountChip(250),
            _quickAmountChip(500),
            _quickAmountChip(1000),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Minimum donation amount is ₱20.',
          style: TextStyle(
            fontSize: 11,
            color: AppColors.subtitleColor,
          ),
        ),
      ],
    );
  }

  Widget _quickAmountChip(double value) {
    final selected = amountValue == value;

    return GestureDetector(
      onTap: () {
        _setAmount(value);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(
          horizontal: 15,
          vertical: 10,
        ),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primaryColor
              : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected
                ? AppColors.primaryColor
                : Colors.grey.shade200,
          ),
        ),
        child: Text(
          '₱${value.toStringAsFixed(0)}',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: selected
                ? Colors.white
                : Colors.black87,
          ),
        ),
      ),
    );
  }

  Widget _destinationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(
          'Donation Purpose',
          'Choose where your donation will be directed.',
        ),
        const SizedBox(height: 13),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
            ),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: destination,
              isExpanded: true,
              icon: Icon(
                Icons.keyboard_arrow_down_rounded,
                color: AppColors.primaryColor,
              ),
              items: destinations.map(
                (item) {
                  return DropdownMenuItem<String>(
                    value: item,
                    child: Text(
                      item,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                },
              ).toList(),
              onChanged: (value) {
                if (value == null) return;

                setState(() {
                  destination = value;
                });
              },
            ),
          ),
        ),
        const SizedBox(height: 10),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.grey.shade200,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.info_outline_rounded,
                size: 18,
                color: AppColors.primaryColor,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  destinationDescriptions[destination] ?? '',
                  style: TextStyle(
                    fontSize: 11.5,
                    height: 1.4,
                    color: AppColors.subtitleColor,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _paymentSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(
          'Payment Method',
          'Complete your donation securely through PayMongo.',
        ),
        const SizedBox(height: 13),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primaryColor.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  Icons.qr_code_2_rounded,
                  color: AppColors.primaryColor,
                  size: 25,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'QRPH PayMongo',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Secure online payment',
                      style: TextStyle(
                        fontSize: 11.5,
                        color: AppColors.subtitleColor,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Secure',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.green,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _notesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _sectionTitle(
          'Note',
          'Add a short message if needed.',
        ),
        const SizedBox(height: 13),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.grey.shade200,
            ),
          ),
          child: TextField(
            controller: notes,
            maxLines: 3,
            maxLength: 250,
            decoration: InputDecoration(
              hintText: 'Optional note',
              hintStyle: TextStyle(
                color: Colors.grey.shade400,
                fontSize: 13,
              ),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.all(15),
              counterStyle: TextStyle(
                color: AppColors.subtitleColor,
                fontSize: 10,
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Stack(
          children: [
            SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(
                20,
                16,
                20,
                32,
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  _header(),
                  const SizedBox(height: 27),
                  _amountSection(),
                  const SizedBox(height: 27),
                  _destinationSection(),
                  const SizedBox(height: 27),
                  _paymentSection(),
                  const SizedBox(height: 27),
                  _notesSection(),
                  const SizedBox(height: 25),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed:
                          loading ? null : _confirmDonation,
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            AppColors.primaryColor,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor:
                            AppColors.primaryColor
                                .withOpacity(0.5),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(14),
                        ),
                      ),
                      child: const Row(
                        mainAxisAlignment:
                            MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.lock_outline_rounded,
                            size: 18,
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Continue to Payment',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Center(
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.verified_user_outlined,
                          size: 14,
                          color: AppColors.subtitleColor,
                        ),
                        const SizedBox(width: 5),
                        Text(
                          'Secure checkout powered by PayMongo',
                          style: TextStyle(
                            fontSize: 10.5,
                            color: AppColors.subtitleColor,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 10),
                  Center(
                    child: TextButton.icon(
                      onPressed: () {
                        _showMessage(
                          'For payment concerns, please contact the church administration.',
                        );
                      },
                      icon: Icon(
                        Icons.help_outline_rounded,
                        size: 16,
                        color: AppColors.primaryColor,
                      ),
                      label: Text(
                        'Need help with your donation?',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: AppColors.primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            if (loading)
              Positioned.fill(
                child: Container(
                  color: Colors.black.withOpacity(0.18),
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 20,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                            BorderRadius.circular(16),
                      ),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircularProgressIndicator(),
                          SizedBox(height: 14),
                          Text(
                            'Preparing payment...',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
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
}