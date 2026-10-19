

import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import '../services/api_service.dart';

class AnnouncementsScreen extends StatefulWidget {
  final String userName;
  final String email;
  final bool isTab;
  final VoidCallback? onBackToHome;

  const AnnouncementsScreen({
    super.key,
    this.userName = '',
    this.email = '',
    this.isTab = false,
    this.onBackToHome,
  });

  @override
  State<AnnouncementsScreen> createState() =>
      _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  final ApiService _apiService = ApiService();

  List<Map<String, dynamic>> _announcements = [];
  final Set<String> _expandedIds = {};

  bool _isLoading = true;
  String? _errorMessage;
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _loadAnnouncements();
  }

  Future<void> _loadAnnouncements() async {
    if (!mounted) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final dynamic response = await _apiService.getAnnouncements();

      List<dynamic> announcementList = [];

      if (response is List) {
        announcementList = response;
      } else if (response is Map) {
        final dynamic data = response['data'] ??
            response['announcements'] ??
            response['results'];

        if (data is List) {
          announcementList = data;
        } else if (data is Map) {
          announcementList = [data];
        }
      }

      final parsedAnnouncements = announcementList
          .whereType<Map>()
          .map(
            (item) => Map<String, dynamic>.from(item),
          )
          .toList();

      parsedAnnouncements.sort((a, b) {
        final bool aPinned = _isPinned(a);
        final bool bPinned = _isPinned(b);

        if (aPinned != bPinned) {
          return aPinned ? -1 : 1;
        }

        final DateTime? dateA = _getCreatedAtDate(a);
        final DateTime? dateB = _getCreatedAtDate(b);

        if (dateA == null && dateB == null) return 0;
        if (dateA == null) return 1;
        if (dateB == null) return -1;

        return dateB.compareTo(dateA);
      });

      if (!mounted) return;

      setState(() {
        _announcements = parsedAnnouncements;
        _isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _errorMessage =
            'Unable to load announcements. Please try again.';
        _isLoading = false;
      });
    }
  }

  bool _isPinned(Map<String, dynamic> announcement) {
    final dynamic value = announcement['isPinned'] ??
        announcement['is_pinned'] ??
        announcement['pinned'];

    return value == true ||
        value == 1 ||
        value?.toString().toLowerCase() == 'true';
  }

  DateTime? _getCreatedAtDate(Map<String, dynamic> announcement) {
    final dynamic value = announcement['createdAt'] ??
        announcement['created_at'] ??
        announcement['date'];

    if (value == null || value.toString().trim().isEmpty) {
      return null;
    }

    return DateTime.tryParse(value.toString());
  }

  String _getId(Map<String, dynamic> announcement, int index) {
    return (announcement['_id'] ?? announcement['id'] ?? index.toString()).toString();
  }

  String _getTitle(Map<String, dynamic> announcement) {
    return (announcement['title'] ??
            announcement['announcementTitle'] ??
            announcement['announcement_title'] ??
            'Untitled Announcement')
        .toString();
  }

  String _getContent(Map<String, dynamic> announcement) {
    return (announcement['content'] ??
            announcement['message'] ??
            announcement['description'] ??
            announcement['body'] ??
            'No additional details available.')
        .toString();
  }

  String _getCategory(Map<String, dynamic> announcement) {
    return (announcement['category'] ??
            announcement['type'] ??
            'General')
        .toString();
  }

  String _getLocation(Map<String, dynamic> announcement) {
    return (announcement['location'] ??
            announcement['venue'] ??
            '')
        .toString();
  }

  String _getWhen(Map<String, dynamic> announcement) {
    return (announcement['eventDate'] ??
            announcement['event_date'] ??
            '')
        .toString();
  }

  String _getWho(Map<String, dynamic> announcement) {
    return (announcement['who'] ??
            announcement['targetAudience'] ??
            announcement['audience'] ??
            '')
        .toString();
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return 'Recently';

    final local = date.toLocal();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    final hour = local.hour > 12 ? local.hour - 12 : (local.hour == 0 ? 12 : local.hour);
    final period = local.hour >= 12 ? 'PM' : 'AM';
    final minute = local.minute.toString().padLeft(2, '0');

    return '${months[local.month - 1]} ${local.day}, ${local.year} • $hour:$minute $period';
  }

  List<String> get _categories {
    final categories = _announcements
        .map(_getCategory)
        .where((category) => category.trim().isNotEmpty)
        .toSet()
        .toList();

    categories.sort();

    return ['All', ...categories];
  }

  List<Map<String, dynamic>> get _filteredAnnouncements {
    return _announcements.where((announcement) {
      final category = _getCategory(announcement);
      return _selectedCategory == 'All' || category == _selectedCategory;
    }).toList();
  }

  void _clearFilters() {
    setState(() {
      _selectedCategory = 'All';
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredAnnouncements = _filteredAnnouncements;

    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          tooltip: 'Back',
          onPressed: () {
            if (widget.onBackToHome != null) {
              widget.onBackToHome!();
            } else if (Navigator.canPop(context)) {
              Navigator.pop(context);
            }
          },
        ),
        title: const Text(
          'Announcements',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          // Heading and announcement count
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Latest Announcements',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
              ),
              if (!_isLoading)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 11,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight.withValues(
                      alpha: 0.25,
                    ),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${filteredAnnouncements.length}',
                    style: const TextStyle(
                      color: AppColors.primaryDark,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 12),

          // Category filter
          if (!_isLoading &&
              _errorMessage == null &&
              _announcements.isNotEmpty)
            DropdownButtonFormField<String>(
              value: _categories.contains(_selectedCategory)
                  ? _selectedCategory
                  : 'All',
              decoration: InputDecoration(
                labelText: 'Category',
                labelStyle: const TextStyle(
                  color: AppColors.subtitleColor,
                  fontSize: 13,
                ),
                prefixIcon: const Icon(
                  Icons.filter_list_rounded,
                  color: AppColors.primaryColor,
                ),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 10,
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: AppColors.primaryLight.withValues(
                      alpha: 0.4,
                    ),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: AppColors.primaryLight.withValues(
                      alpha: 0.4,
                    ),
                  ),
                ),
              ),
              items: _categories.map((category) {
                return DropdownMenuItem<String>(
                  value: category,
                  child: Text(
                    category,
                    style: const TextStyle(fontSize: 13),
                  ),
                );
              }).toList(),
              onChanged: (value) {
                if (value == null) return;

                setState(() {
                  _selectedCategory = value;
                });
              },
            ),

          const SizedBox(height: 16),

          // Loading state: circular spinner
          if (_isLoading)
            const SizedBox(
              height: 180,
              child: Center(
                child: SizedBox(
                  width: 30,
                  height: 30,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    color: AppColors.primaryColor,
                  ),
                ),
              ),
            )
          else if (_errorMessage != null)
            _buildMessageState(
              icon: Icons.cloud_off_rounded,
              title: 'Unable to load announcements',
              message: _errorMessage!,
              actionLabel: 'Try Again',
              onAction: _loadAnnouncements,
            )
          else if (filteredAnnouncements.isEmpty)
            _buildMessageState(
              icon: Icons.campaign_outlined,
              title: _announcements.isEmpty
                  ? 'No announcements yet'
                  : 'No matching announcements',
              message: _announcements.isEmpty
                  ? 'New announcements will appear here when available.'
                  : 'Try selecting a different category.',
              actionLabel:
                  _announcements.isEmpty ? null : 'Clear Filters',
              onAction:
                  _announcements.isEmpty ? null : _clearFilters,
            )
          else
            ...filteredAnnouncements.asMap().entries.map(
                  (entry) => _buildAnnouncementCard(entry.value, entry.key),
                ),
        ],
      ),
    );
  }

  Widget _buildMessageState({
    required IconData icon,
    required String title,
    required String message,
    String? actionLabel,
    VoidCallback? onAction,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 22,
        vertical: 30,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.primaryLight.withValues(alpha: 0.35),
        ),
      ),
      child: Column(
        children: [
          Icon(
            icon,
            size: 42,
            color: AppColors.primaryColor,
          ),
          const SizedBox(height: 12),
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: AppColors.titleColor,
            ),
          ),
          const SizedBox(height: 7),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontSize: 13,
              height: 1.5,
              color: AppColors.subtitleColor,
            ),
          ),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: onAction,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryColor,
                side: const BorderSide(
                  color: AppColors.primaryColor,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(actionLabel),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAnnouncementCard(
    Map<String, dynamic> announcement,
    int index,
  ) {
    final id = _getId(announcement, index);
    final title = _getTitle(announcement);
    final content = _getContent(announcement);
    final category = _getCategory(announcement);
    final location = _getLocation(announcement);
    final when = _getWhen(announcement);
    final who = _getWho(announcement);
    final createdAtDate = _getCreatedAtDate(announcement);
    final isPinned = _isPinned(announcement);
    final isExpanded = _expandedIds.contains(id);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isPinned
              ? AppColors.primaryColor.withValues(alpha: 0.45)
              : AppColors.primaryLight.withValues(alpha: 0.35),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.035),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: InkWell(
        onTap: () {
          setState(() {
            if (isExpanded) {
              _expandedIds.remove(id);
            } else {
              _expandedIds.add(id);
            }
          });
        },
        borderRadius: BorderRadius.circular(18),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title and Tags (Megaphone icon removed)
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 15,
                            height: 1.35,
                            fontWeight: FontWeight.w800,
                            color: AppColors.titleColor,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Wrap(
                          spacing: 7,
                          runSpacing: 6,
                          children: [
                            _buildTag(
                              category,
                              backgroundColor:
                                  AppColors.primaryLight.withValues(
                                alpha: 0.25,
                              ),
                              textColor: AppColors.primaryDark,
                            ),
                            if (isPinned)
                              _buildTag(
                                'Pinned',
                                backgroundColor: const Color(0xFFFFF1D6),
                                textColor: const Color(0xFF966100),
                                icon: Icons.push_pin_rounded,
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Icon(
                    isExpanded
                        ? Icons.keyboard_arrow_up_rounded
                        : Icons.keyboard_arrow_down_rounded,
                    color: AppColors.primaryColor,
                    size: 24,
                  ),
                ],
              ),

              const SizedBox(height: 10),

              // Date + Time Posted
              _buildMetadata(
                Icons.access_time_rounded,
                'Posted: ${_formatDateTime(createdAtDate)}',
              ),

              // Expandable/Collapsible details (hidden initially)
              if (isExpanded) ...[
                const SizedBox(height: 14),
                Divider(
                  height: 1,
                  color: AppColors.primaryLight.withValues(alpha: 0.35),
                ),
                const SizedBox(height: 14),

                // What (Content)
                _buildSectionRow('What', content),

                // Where (Location)
                if (location.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  _buildSectionRow('Where', location),
                ],

                // When (Event Date / Schedule)
                if (when.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  _buildSectionRow('When', when),
                ],

                // Who (Target audience / beneficiaries)
                if (who.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  _buildSectionRow('Who', who),
                ],
              ],

              const SizedBox(height: 10),

              // Collapse / Expand toggle button text
              Align(
                alignment: Alignment.centerRight,
                child: Text(
                  isExpanded ? 'Show less' : 'View details',
                  style: const TextStyle(
                    color: AppColors.primaryColor,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionRow(String label, String text) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.primaryColor,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 3),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            height: 1.5,
            color: AppColors.titleColor,
          ),
        ),
      ],
    );
  }

  Widget _buildTag(
    String label, {
    required Color backgroundColor,
    required Color textColor,
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w700,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetadata(IconData icon, String text) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icon,
          size: 14,
          color: AppColors.subtitleColor,
        ),
        const SizedBox(width: 5),
        Flexible(
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.subtitleColor,
            ),
          ),
        ),
      ],
    );
  }
}

