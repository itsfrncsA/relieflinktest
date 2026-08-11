import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../constants/app_colors.dart';
import '../services/api_service.dart';

class DonationScreen extends StatefulWidget {
  const DonationScreen({super.key});

  @override
  State<DonationScreen> createState() => _DonationScreenState();
}

class _DonationScreenState extends State<DonationScreen> {
  final TextEditingController amountController = TextEditingController();
  final TextEditingController notesController = TextEditingController();

  XFile? proofImage;
  final ImagePicker picker = ImagePicker();

  String paymentMethod = "QR Ph (InstaPay)";
  bool isLoading = false;
  String? userName;
  String? userId;

  final paymentMethods = ["QR Ph (InstaPay)", "GCash", "Maya", "Bank Transfer"];

  bool get isFormValid => amountController.text.isNotEmpty;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    ApiService api = ApiService();
    try {
      var result = await api.getUserProfile();
      if (result['success'] && result['data'] != null) {
        setState(() {
          userName = result['data']['name'];
          userId = result['data']['_id'];
        });
      }
    } catch (e) {
      print("Error loading user data: $e");
    }
  }

  Future<void> pickProofImage() async {
    final pickedFile =
        await picker.pickImage(source: ImageSource.gallery, imageQuality: 50);
    if (pickedFile != null) {
      setState(() => proofImage = pickedFile);
    }
  }

  // Show success popup and clear form
  void _showSuccessPopup() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text("Donation Complete!"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 60),
            const SizedBox(height: 10),
            const Text("Your donation has been submitted successfully."),
            const SizedBox(height: 10),
            Text("Amount: ₱${amountController.text}"),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // Close popup
              // Clear all form fields
              amountController.clear();
              notesController.clear();
              setState(() {
                proofImage = null;
                isLoading = false;
              });
              // Go back to previous screen (optional)
              // Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryColor,
            ),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  // Show error popup
  void _showErrorPopup(String error) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Donation Failed"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error, color: Colors.red, size: 60),
            const SizedBox(height: 10),
            Text(error),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  void showConfirmationDialog() {
    // Validate amount
    double? amount = double.tryParse(amountController.text);
    if (amount == null || amount <= 0) {
      _showErrorPopup("Please enter a valid amount");
      return;
    }

    // Validate proof of payment for digital payment methods
    if (paymentMethod != "Cash" && proofImage == null) {
      _showErrorPopup("Please attach a screenshot of your payment receipt as proof.");
      return;
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("Confirm Donation"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _summaryRow("Amount", "₱ ${amountController.text}"),
            _summaryRow("Payment", paymentMethod),
            _summaryRow(
              "Notes",
              notesController.text.isEmpty ? "None" : notesController.text,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // Close confirmation dialog
              submitDonation();
            },
            child: const Text("Confirm"),
          ),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text("$label:",
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Expanded(flex: 5, child: Text(value)),
        ],
      ),
    );
  }

  // SUBMIT DONATION TO BACKEND
  Future<void> submitDonation() async {
    double? amount = double.tryParse(amountController.text);
    if (amount == null || amount <= 0) {
      _showErrorPopup("Please enter a valid amount");
      return;
    }

    // Double check proof image validation
    if (paymentMethod != "Cash" && proofImage == null) {
      _showErrorPopup("Please attach your payment receipt screenshot.");
      return;
    }

    setState(() => isLoading = true);

    ApiService api = ApiService();

    String cleanPaymentMethod = "GCash";
    if (paymentMethod.contains("Maya")) {
      cleanPaymentMethod = "Maya";
    } else if (paymentMethod.contains("Bank")) {
      cleanPaymentMethod = "Bank Transfer";
    }

    Map<String, dynamic> donationData = {
      'donorName': userName ?? 'Anonymous',
      'amount': amount,
      'paymentMethod': cleanPaymentMethod,
      'notes': notesController.text,
    };

    try {
      var result = await api.createDonation(donationData);

      if (result['success'] == true) {
        dynamic data = result['data'] ?? result;
        String? donationId;
        if (data is Map) {
          donationId = data['_id']?.toString() ?? data['id']?.toString();
        }
        
        // If an image is selected, upload it as the receipt attachment
        if (proofImage != null && donationId != null) {
          final bytes = await proofImage!.readAsBytes();
          var uploadResult = await api.uploadDonationReceipt(
              donationId, proofImage!.path, bytes, proofImage!.name);
              
          setState(() => isLoading = false);
          
          if (uploadResult['success'] == true) {
            _showSuccessPopup();
          } else {
            _showErrorPopup("Donation saved, but receipt upload failed: " +
                (uploadResult['error'] ?? "Unknown upload error"));
          }
        } else {
          setState(() => isLoading = false);
          _showSuccessPopup();
        }
      } else {
        setState(() => isLoading = false);
        _showErrorPopup(
            result['error'] ?? result['message'] ?? "Donation failed");
      }
    } catch (e) {
      setState(() => isLoading = false);
      _showErrorPopup("Network error: ${e.toString()}");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Make Donation"),
        backgroundColor: AppColors.primaryColor,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildInfoCard(),
            const SizedBox(height: 20),
            _sectionTitle("Donation Details"),
            TextField(
              controller: amountController,
              keyboardType: TextInputType.number,
              onChanged: (_) => setState(() {}),
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^\d+\.?\d{0,2}')),
              ],
              decoration: const InputDecoration(
                labelText: "Donation Amount",
                prefixText: "₱ ",
                prefixIcon: Icon(Icons.money),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            _sectionTitle("Payment Method"),
            Wrap(
              spacing: 10,
              children: paymentMethods.map((method) {
                return ChoiceChip(
                  label: Text(method),
                  selected: paymentMethod == method,
                  selectedColor: AppColors.primaryColor,
                  labelStyle: TextStyle(
                      color: paymentMethod == method
                          ? Colors.white
                          : Colors.black),
                  onSelected: (_) => setState(() => paymentMethod = method),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            Center(
              child: Column(
                children: [
                  if (amountController.text.isNotEmpty && double.tryParse(amountController.text) != null && double.parse(amountController.text) > 0)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      margin: const EdgeInsets.only(bottom: 10),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.green.shade300),
                      ),
                      child: Text(
                        "Scan QR to pay exact amount: ₱${amountController.text}",
                        style: TextStyle(fontWeight: FontWeight.bold, color: Colors.green.shade800, fontSize: 13),
                      ),
                    ),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.08),
                          blurRadius: 15,
                          offset: const Offset(0, 4),
                        ),
                      ],
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: Image.asset('assets/images/payment_qr.png', height: 260),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            const SizedBox(height: 15),
            TextField(
              controller: notesController,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Notes (Optional)",
                hintText: "e.g. Donation for medical assistance",
                prefixIcon: Icon(Icons.note),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 15,
              runSpacing: 10,
              children: [
                ElevatedButton.icon(
                  onPressed: pickProofImage,
                  icon: const Icon(Icons.attach_file),
                  label: const Text("Attach Proof"),
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accentColor),
                ),
                if (proofImage != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: kIsWeb
                        ? Image.network(
                            proofImage!.path,
                            height: 80,
                            width: 80,
                            fit: BoxFit.cover,
                          )
                        : Image.file(
                            File(proofImage!.path),
                            height: 80,
                            width: 80,
                            fit: BoxFit.cover,
                          ),
                  ),
              ],
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading ? null : showConfirmationDialog,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryColor,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Submit Donation"),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildInfoCard() {
    return const Card(
      elevation: 2,
      child: Padding(
        padding: EdgeInsets.all(12),
        child: Text(
          "Scan the QR code and complete your payment. "
          "Fill in the details and upload proof for verification.",
          style: TextStyle(fontSize: 14),
        ),
      ),
    );
  }
}
