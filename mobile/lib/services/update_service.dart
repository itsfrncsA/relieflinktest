import 'package:flutter/material.dart';
import 'package:ota_update/ota_update.dart';
import 'package:url_launcher/url_launcher.dart';

import '../constants/app_colors.dart';
import 'api_service.dart';

class UpdateService {
  // Current version installed on this device
  static const int currentVersionCode = 3;
  static const String currentVersionName = '1.0.3';

  static bool _isChecking = false;

  /// Check server for app updates.
  /// If [silent] is true, no dialog is shown if the app is already up to date.
  static Future<void> checkUpdate(
    BuildContext context, {
    bool silent = false,
  }) async {
    if (_isChecking) return;
    _isChecking = true;

    try {
      final res = await ApiService().getAppVersion();

      if (!context.mounted) return;

      if (res['success'] != true) {
        if (!silent) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Unable to check for updates at this moment.'),
            ),
          );
        }
        return;
      }

      final int latestCode = int.tryParse(
            res['versionCode']?.toString() ?? '',
          ) ??
          0;
      final String latestVersion = res['version']?.toString() ?? '1.0.0';
      final String apkUrl = res['apkUrl']?.toString() ?? '';
      final String notes = res['releaseNotes']?.toString() ??
          'Includes general performance and stability improvements.';

      if (latestCode > currentVersionCode && apkUrl.isNotEmpty) {
        await _showUpdateDialog(
          context,
          version: latestVersion,
          notes: notes,
          apkUrl: apkUrl,
        );
      } else if (!silent) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'You are using the latest version of ReliefLink (v$currentVersionName).',
            ),
            backgroundColor: AppColors.primaryColor,
          ),
        );
      }
    } catch (_) {
      if (!silent && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Could not reach the update server.'),
          ),
        );
      }
    } finally {
      _isChecking = false;
    }
  }

  static Future<void> _showUpdateDialog(
    BuildContext context, {
    required String version,
    required String notes,
    required String apkUrl,
  }) async {
    bool isDownloading = false;
    double progress = 0;
    String statusMessage = 'Downloading update...';

    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            void startOtaDownload() {
              setDialogState(() {
                isDownloading = true;
                progress = 0;
                statusMessage = 'Connecting to download server...';
              });

              try {
                OtaUpdate()
                    .execute(
                  apkUrl,
                  destinationFilename: 'ReliefLink.apk',
                )
                    .listen(
                  (OtaEvent event) {
                    if (!dialogContext.mounted) return;

                    if (event.status == OtaStatus.DOWNLOADING) {
                      final val = double.tryParse(event.value ?? '0') ?? 0;
                      setDialogState(() {
                        progress = (val / 100.0).clamp(0.0, 1.0);
                        statusMessage = 'Downloading update: ${val.toInt()}%';
                      });
                    } else if (event.status == OtaStatus.INSTALLING) {
                      setDialogState(() {
                        progress = 1.0;
                        statusMessage = 'Opening Android Installer...';
                      });
                    } else if (event.status == OtaStatus.ALREADY_RUNNING_ERROR) {
                      setDialogState(() {
                        statusMessage = 'Update already running...';
                      });
                    } else {
                      // Fallback to browser direct download if OTA fails
                      _fallbackBrowserDownload(dialogContext, apkUrl);
                    }
                  },
                  onError: (_) {
                    _fallbackBrowserDownload(dialogContext, apkUrl);
                  },
                );
              } catch (_) {
                _fallbackBrowserDownload(dialogContext, apkUrl);
              }
            }

            return Dialog(
              backgroundColor: Colors.transparent,
              insetPadding: const EdgeInsets.symmetric(horizontal: 24),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.14),
                      blurRadius: 30,
                      offset: const Offset(0, 10),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Header
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.primaryColor,
                              AppColors.primaryColor.withOpacity(0.85),
                            ],
                          ),
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 64,
                              height: 64,
                              decoration: const BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.system_update_rounded,
                                size: 34,
                                color: AppColors.primaryColor,
                              ),
                            ),
                            const SizedBox(height: 14),
                            const Text(
                              'New Update Available!',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                'Version $version Available',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Content
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (!isDownloading) ...[
                              Text(
                                "WHAT'S NEW",
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                  color: AppColors.subtitleColor,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFF8FAFC),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFE2E8F0),
                                  ),
                                ),
                                child: Text(
                                  notes,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    height: 1.45,
                                    color: Color(0xFF334155),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 20),
                              SizedBox(
                                width: double.infinity,
                                height: 46,
                                child: ElevatedButton(
                                  onPressed: startOtaDownload,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primaryColor,
                                    foregroundColor: Colors.white,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  child: const Text(
                                    'Update Now',
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              SizedBox(
                                width: double.infinity,
                                child: TextButton(
                                  onPressed: () => Navigator.pop(dialogContext),
                                  child: Text(
                                    'Later',
                                    style: TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.subtitleColor,
                                    ),
                                  ),
                                ),
                              ),
                            ] else ...[
                              Center(
                                child: Column(
                                  children: [
                                    Text(
                                      statusMessage,
                                      style: const TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: Color(0xFF0F172A),
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: LinearProgressIndicator(
                                        value: progress > 0 ? progress : null,
                                        minHeight: 8,
                                        backgroundColor:
                                            const Color(0xFFE2E8F0),
                                        valueColor: AlwaysStoppedAnimation(
                                          AppColors.primaryColor,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 14),
                                    Text(
                                      'Please wait while the update downloads. The system installer will open automatically.',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: AppColors.subtitleColor,
                                        height: 1.4,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
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
      },
    );
  }

  static Future<void> _fallbackBrowserDownload(
    BuildContext context,
    String apkUrl,
  ) async {
    if (context.mounted) {
      Navigator.of(context, rootNavigator: true).pop();
    }

    try {
      final uri = Uri.parse(apkUrl);
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }
}
