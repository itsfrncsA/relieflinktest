  import 'package:flutter/material.dart';
  import 'package:image_picker/image_picker.dart';
  import 'dart:io';
  import 'package:flutter/services.dart';
  import '../constants/app_colors.dart';
  import '../services/api_service.dart';

  class DonationScreen extends StatefulWidget {
    const DonationScreen({super.key});

    @override
    State<DonationScreen> createState() => _DonationScreenState();
  }

  class _DonationScreenState extends State<DonationScreen> {
    final TextEditingController amountController = TextEditingController();
    final TextEditingController referenceController = TextEditingController();
    final TextEditingController notesController = TextEditingController();

    File? proofImage;
    final ImagePicker picker = ImagePicker();

    String selectedDestination = "Barangay Health Center";
    String paymentMethod = "GCash";
    bool isLoading = false;

    final destinations = [
      "Barangay Health Center",
      "Local School Fund",
      "Community Pantry",
      "Barangay Feeding Program",
    ];

    final paymentMethods = ["GCash", "Maya", "Bank Transfer"];

    bool get isFormValid =>
        amountController.text.isNotEmpty &&
        referenceController.text.isNotEmpty;

    Future<void> pickProofImage() async {
      final pickedFile =
          await picker.pickImage(source: ImageSource.gallery, imageQuality: 50);
      if (pickedFile != null) {
        setState(() => proofImage = File(pickedFile.path));
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
              Text("Reference: ${referenceController.text}"),
            ],
          ),
          actions: [
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close popup
                // Clear all form fields
                amountController.clear();
                referenceController.clear();
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

      if (referenceController.text.trim().isEmpty) {
        _showErrorPopup("Please enter a reference number");
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
              _summaryRow("Destination", selectedDestination),
              _summaryRow("Payment", paymentMethod),
              _summaryRow("Reference", referenceController.text),
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

      setState(() => isLoading = true);

      ApiService api = ApiService();
      
      Map<String, dynamic> donationData = {
        'donorName': 'Mobile Donor',
        'amount': amount,
        'paymentMethod': paymentMethod,
        'referenceNumber': referenceController.text,
        'notes': notesController.text,
        'destination': selectedDestination,
      };

      try {
        var result = await api.createDonation(donationData);
        
        setState(() => isLoading = false);

        if (result['success'] == true) {
          _showSuccessPopup();
        } else {
          _showErrorPopup(result['error'] ?? result['message'] ?? "Donation failed");
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

              _sectionTitle("Donation Destination"),
              DropdownButtonFormField(
                value: selectedDestination,
                items: destinations
                    .map((d) => DropdownMenuItem(value: d, child: Text(d)))
                    .toList(),
                onChanged: (value) =>
                    setState(() => selectedDestination = value!),
                decoration: const InputDecoration(border: OutlineInputBorder()),
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
                        color:
                            paymentMethod == method ? Colors.white : Colors.black),
                    onSelected: (_) =>
                        setState(() => paymentMethod = method),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              Center(
                child: Image.asset('assets/images/payment_qr.png', height: 180),
              ),

              const SizedBox(height: 30),

              _sectionTitle("Donation Details"),

              TextField(
                controller: amountController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.allow(
                      RegExp(r'^\d+\.?\d{0,2}')),
                ],
                decoration: const InputDecoration(
                  labelText: "Donation Amount",
                  prefixText: "₱ ",
                  prefixIcon: Icon(Icons.money),
                  border: OutlineInputBorder(),
                ),
              ),

              const SizedBox(height: 15),

              TextField(
                controller: referenceController,
                decoration: const InputDecoration(
                  labelText: "Reference Number",
                  prefixIcon: Icon(Icons.confirmation_number),
                  border: OutlineInputBorder(),
                ),
              ),

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

              Row(
                children: [
                  ElevatedButton.icon(
                    onPressed: pickProofImage,
                    icon: const Icon(Icons.attach_file),
                    label: const Text("Attach Proof"),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.accentColor),
                  ),
                  const SizedBox(width: 15),
                  if (proofImage != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.file(
                        proofImage!,
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
      return Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Text(
            "Scan the QR code and complete your payment. "
            "Fill in the details and upload proof for verification.",
            style: const TextStyle(fontSize: 14),
          ),
        ),
      );
    }
  }