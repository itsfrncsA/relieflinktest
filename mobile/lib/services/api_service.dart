import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart' as http_parser;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static String get baseUrl {
    if (kDebugMode) {
      if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:5001/api';
      }
      return 'http://localhost:5001/api';
    }
    return 'https://relieflink-4a13cb419236.herokuapp.com/api';
  }

  Map<String, dynamic> _parseResponse(http.Response response) {
    try {
      final dynamic decoded = jsonDecode(response.body);
      if (decoded is List) {
        final isSuccess = response.statusCode >= 200 && response.statusCode < 300;
        return {
          'success': isSuccess,
          'data': isSuccess ? decoded : [],
          'statusCode': response.statusCode,
        };
      }
      if (decoded is Map) {
        final Map<String, dynamic> data = decoded as Map<String, dynamic>;
        if (data.containsKey('success')) return data;
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return {'success': true, ...data};
        } else {
          return {
            'success': false,
            'error': data['message'] ?? data['error'] ?? 'Request failed',
            'statusCode': response.statusCode,
            ...data,
          };
        }
      }
      return {
        'success': response.statusCode >= 200 && response.statusCode < 300,
        'error': 'Invalid response type: ${decoded.runtimeType}',
        'statusCode': response.statusCode,
      };
    } catch (e) {
      return {
        'success': false,
        'error': 'Failed to parse response: ${e.toString()}',
        'statusCode': response.statusCode,
      };
    }
  }

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      final dynamic decoded = jsonDecode(response.body);
      if (decoded is! Map) {
        return {'success': false, 'error': 'Invalid response format from server'};
      }
      final Map<String, dynamic> responseData = decoded as Map<String, dynamic>;
      if (response.statusCode == 200 && responseData['token'] != null) {
        await _saveToken(responseData['token']);
        return {'success': true, 'data': responseData};
      } else {
        return {
          'success': false,
          'error': responseData['message'] ?? responseData['error'] ?? 'Login failed'
        };
      }
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> register(String name, String email, String password, {String? phone}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register-mobile'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': name,
          'email': email,
          'password': password,
          if (phone != null) 'phone': phone
        }),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> sendOtp(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/otp/send'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String email, String code) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/otp/verify'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'code': code}),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> changePassword(String email, String currentPassword, String newPassword) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/change-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'currentPassword': currentPassword,
          'newPassword': newPassword
        }),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/forgot-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> verifyResetOtp(String email, String otp) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/verify-reset-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> resetPassword(String email, String otp, String newPassword) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/reset-password'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp, 'newPassword': newPassword}),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> createDonation(Map<String, dynamic> donationData) async {
    try {
      String? token = await _getToken();
      final response = await http.post(
        Uri.parse('$baseUrl/donations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(donationData),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getDonationHistory() async {
    try {
      String? token = await _getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/donations'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getPublicDonations() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/donations/public'),
        headers: {'Content-Type': 'application/json'},
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getPublicExpenses() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/expenses/public'),
        headers: {'Content-Type': 'application/json'},
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> updateProfile(String userId, String newName, {String? phoneNumber}) async {
    try {
      String? token = await _getToken();
      final body = {'name': newName};
      if (phoneNumber != null && phoneNumber.isNotEmpty) {
        body['phone'] = phoneNumber;
      }
      final response = await http.put(
        Uri.parse('$baseUrl/users/$userId'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> getUserProfile() async {
    try {
      String? token = await _getToken();
      final response = await http.get(
        Uri.parse('$baseUrl/users/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> uploadDonationReceipt(
      String donationId, String filePath, List<int>? bytes, String fileName) async {
    try {
      String? token = await _getToken();
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('$baseUrl/donations/$donationId/upload-receipt'),
      );
      request.headers['Authorization'] = 'Bearer $token';
      if (bytes != null && bytes.isNotEmpty) {
        final ext = fileName.toLowerCase();
        final isPng = ext.endsWith('.png');
        final isPdf = ext.endsWith('.pdf');
        final isGif = ext.endsWith('.gif');
        final contentType = isPng
            ? http_parser.MediaType('image', 'png')
            : isPdf
                ? http_parser.MediaType('application', 'pdf')
                : isGif
                    ? http_parser.MediaType('image', 'gif')
                    : http_parser.MediaType('image', 'jpeg');
        request.files.add(
          http.MultipartFile.fromBytes(
            'receipt',
            bytes,
            filename: fileName.isNotEmpty ? fileName : 'receipt_proof.png',
            contentType: contentType,
          ),
        );
      } else if (filePath.isNotEmpty) {
        request.files.add(await http.MultipartFile.fromPath('receipt', filePath));
      }
      var streamedResponse = await request.send();
      var response = await http.Response.fromStream(streamedResponse);
      return _parseResponse(response);
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }
}