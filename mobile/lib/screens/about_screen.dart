import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../widgets/app_drawer.dart';

class AboutScreen extends StatefulWidget {
  final String userName;
  final String email;

  const AboutScreen({
    super.key,
    this.userName = 'Guest',
    this.email = '',
  });

  @override
  State<AboutScreen> createState() => _AboutScreenState();
}

class _AboutScreenState extends State<AboutScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8FC),
      drawer: AppDrawer(
        userName: widget.userName,
        email: widget.email,
      ),
      appBar: AppBar(
        elevation: 0,
        scrolledUnderElevation: 0,
        backgroundColor: Colors.white,
        foregroundColor: AppColors.titleColor,
        centerTitle: false,
        title: const Text(
          'About',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.3,
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: 900,
              ),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  16,
                  18,
                  16,
                  45,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildHero(),

                    const SizedBox(height: 24),

                    _buildIntroduction(),

                    const SizedBox(height: 34),

                    _buildSectionHeader(
                      icon: Icons.volunteer_activism_rounded,
                      title: 'Community in Action',
                      subtitle:
                          'People coming together to serve and help others.',
                    ),

                    const SizedBox(height: 16),

                    _buildPhotoRow(
                      image1: 'assets/images/volunteer_1.jpg',
                      image2: 'assets/images/volunteer_2.jpg',
                      label1: 'Volunteer Work',
                      label2: 'Community Service',
                    ),

                    const SizedBox(height: 36),

                    _buildSectionHeader(
                      icon: Icons.music_note_rounded,
                      title: 'Music & Worship',
                      subtitle:
                          'Celebrating faith through music, prayer, and worship.',
                    ),

                    const SizedBox(height: 16),

                    _buildPhotoRow(
                      image1: 'assets/images/choir_1.jpg',
                      image2: 'assets/images/choir_2.jpg',
                      label1: 'Choir Ministry',
                      label2: 'Worship & Music',
                    ),

                    const SizedBox(height: 36),

                    _buildSectionHeader(
                      icon: Icons.groups_rounded,
                      title: 'Apostolate & Service',
                      subtitle:
                          'Faith groups and parishioners serving the community.',
                    ),

                    const SizedBox(height: 16),

                    _buildApostolateGrid(),

                    const SizedBox(height: 38),

                    _buildVisitUsSection(),

                    const SizedBox(height: 18),

                    _buildContactCard(),

                    const SizedBox(height: 18),

                    _buildClosingCard(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  // ============================================================
  // HERO
  // ============================================================

  Widget _buildHero() {
    return ClipRRect(
      borderRadius: BorderRadius.circular(30),
      child: SizedBox(
        width: double.infinity,
        height: 380,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              'assets/images/church_main.jpg',
              fit: BoxFit.cover,
            ),

            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.04),
                    Colors.black.withValues(alpha: 0.18),
                    Colors.black.withValues(alpha: 0.90),
                  ],
                  stops: const [
                    0.0,
                    0.45,
                    1.0,
                  ],
                ),
              ),
            ),

            Positioned(
              top: 18,
              left: 18,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 9,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.96),
                  borderRadius: BorderRadius.circular(30),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.10),
                      blurRadius: 14,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.church_rounded,
                      size: 16,
                      color: AppColors.primaryColor,
                    ),
                    SizedBox(width: 7),
                    Text(
                      'STO. DOMINGO CHURCH',
                      style: TextStyle(
                        color: AppColors.primaryColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 0.7,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            Positioned(
              left: 22,
              right: 22,
              bottom: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 42,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),

                  const SizedBox(height: 12),

                  const Text(
                    'Sto. Domingo\nChurch',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      height: 1.02,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.9,
                    ),
                  ),

                  const SizedBox(height: 10),

                  Text(
                    'National Shrine of Our Lady of the Holy Rosary '
                    'of La Naval de Manila',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.94),
                      fontSize: 13,
                      height: 1.45,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // INTRODUCTION
  // ============================================================

  Widget _buildIntroduction() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        border: Border.all(
          color: const Color(0xFFE4EAF2),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.035),
            blurRadius: 22,
            offset: const Offset(0, 9),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  AppColors.primaryLight,
                  Color(0xFFEAF2FF),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(17),
            ),
            child: const Icon(
              Icons.favorite_rounded,
              color: AppColors.primaryColor,
              size: 25,
            ),
          ),

          const SizedBox(width: 16),

          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'A Community of Faith',
                  style: TextStyle(
                    color: AppColors.titleColor,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    letterSpacing: -0.3,
                  ),
                ),

                SizedBox(height: 8),

                Text(
                  'Sto. Domingo Church is a community where faith '
                  'is expressed through worship, service, music, '
                  'fellowship, and helping others.',
                  style: TextStyle(
                    color: Color(0xFF596579),
                    fontSize: 13,
                    height: 1.65,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // SECTION HEADER
  // ============================================================

  Widget _buildSectionHeader({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 45,
          height: 45,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [
                AppColors.primaryColor,
                AppColors.primaryDark,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(15),
            boxShadow: [
              BoxShadow(
                color: AppColors.primaryColor.withValues(alpha: 0.18),
                blurRadius: 12,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: Icon(
            icon,
            color: Colors.white,
            size: 21,
          ),
        ),

        const SizedBox(width: 13),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.titleColor,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.3,
                ),
              ),

              const SizedBox(height: 4),

              Text(
                subtitle,
                style: const TextStyle(
                  color: Color(0xFF667085),
                  fontSize: 12,
                  height: 1.45,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ============================================================
  // PHOTO ROW
  // ============================================================

  Widget _buildPhotoRow({
    required String image1,
    required String image2,
    required String label1,
    required String label2,
  }) {
    return Row(
      children: [
        Expanded(
          child: _buildPhotoCard(
            image: image1,
            label: label1,
          ),
        ),

        const SizedBox(width: 12),

        Expanded(
          child: _buildPhotoCard(
            image: image2,
            label: label2,
          ),
        ),
      ],
    );
  }

  // ============================================================
  // APOSTOLATE GRID
  // ============================================================

  Widget _buildApostolateGrid() {
    final images = [
      'assets/images/apostolate_1.jpg',
      'assets/images/apostolate_2.jpg',
      'assets/images/apostolate_3.jpg',
      'assets/images/apostolate_4.jpg',
    ];

    final labels = [
      'Legion of Mary',
      'Prayer & Fellowship',
      'Parish Apostolate',
      'Community Service',
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: images.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.08,
      ),
      itemBuilder: (context, index) {
        return _buildPhotoCard(
          image: images[index],
          label: labels[index],
        );
      },
    );
  }

  // ============================================================
  // PHOTO CARD
  // ============================================================

  Widget _buildPhotoCard({
    required String image,
    required String label,
  }) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(22),
      child: AspectRatio(
        aspectRatio: 1.08,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(
              image,
              fit: BoxFit.cover,
            ),

            // Soft dark gradient for readable text
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.transparent,
                    Colors.black.withValues(alpha: 0.78),
                  ],
                  stops: const [
                    0.0,
                    0.48,
                    1.0,
                  ],
                ),
              ),
            ),

            // Small category indicator
            Positioned(
              top: 12,
              left: 12,
              child: Container(
                width: 30,
                height: 30,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.90),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.photo_camera_rounded,
                  color: AppColors.primaryColor,
                  size: 15,
                ),
              ),
            ),

            // Image title
            Positioned(
              left: 14,
              right: 14,
              bottom: 14,
              child: Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  height: 1.25,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.1,
                  shadows: [
                    Shadow(
                      color: Colors.black54,
                      blurRadius: 7,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ============================================================
  // VISIT US
  // ============================================================

  Widget _buildVisitUsSection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFFEAF2FF),
            Color(0xFFF7FAFF),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: const Color(0xFFD9E5F7),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 49,
                height: 49,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primaryColor.withValues(
                        alpha: 0.10,
                      ),
                      blurRadius: 12,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.location_on_rounded,
                  color: AppColors.primaryColor,
                  size: 25,
                ),
              ),

              const SizedBox(width: 13),

              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Visit Us',
                      style: TextStyle(
                        color: AppColors.titleColor,
                        fontSize: 21,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.3,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'We welcome you to our parish community.',
                      style: TextStyle(
                        color: Color(0xFF667085),
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // Address card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(19),
              border: Border.all(
                color: const Color(0xFFE0E8F5),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.025),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(
                  Icons.place_rounded,
                  color: AppColors.primaryColor,
                  size: 22,
                ),

                SizedBox(width: 12),

                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Church Address',
                        style: TextStyle(
                          color: AppColors.titleColor,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),

                      SizedBox(height: 5),

                      Text(
                        '537 Quezon Avenue, Barangay Sto. Domingo',
                        style: TextStyle(
                          color: Color(0xFF667085),
                          fontSize: 12,
                          height: 1.5,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _buildInfoMiniCard(
                  icon: Icons.directions_rounded,
                  title: 'Location',
                  subtitle: 'Quezon City',
                ),
              ),

              const SizedBox(width: 10),

              Expanded(
                child: _buildInfoMiniCard(
                  icon: Icons.phone_rounded,
                  title: 'Contact',
                  subtitle: '8712-6271-72',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ============================================================
  // MINI INFO CARD
  // ============================================================

  Widget _buildInfoMiniCard({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 13,
        vertical: 13,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFE0E8F5),
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(
              icon,
              size: 17,
              color: AppColors.primaryColor,
            ),
          ),

          const SizedBox(width: 9),

          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF98A2B3),
                    fontSize: 9,
                    fontWeight: FontWeight.w700,
                  ),
                ),

                const SizedBox(height: 2),

                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: AppColors.titleColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ============================================================
  // CONTACT CARD
  // ============================================================

  Widget _buildContactCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(21),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFE2E8F0),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.025),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Contact Information',
            style: TextStyle(
              color: AppColors.titleColor,
              fontSize: 18,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.2,
            ),
          ),

          const SizedBox(height: 4),

          const Text(
            'For inquiries and parish concerns',
            style: TextStyle(
              color: Color(0xFF98A2B3),
              fontSize: 11,
              fontWeight: FontWeight.w500,
            ),
          ),

          const SizedBox(height: 18),

          _contactRow(
            icon: Icons.person_outline_rounded,
            title: 'Social Action Center',
            text: 'Edward A Castro',
          ),

          const SizedBox(height: 14),

          _contactRow(
            icon: Icons.location_on_outlined,
            title: 'Address',
            text:
                '537 Quezon Avenue, Barangay Sto. Domingo, Quezon City',
          ),

          const SizedBox(height: 14),

          _contactRow(
            icon: Icons.phone_outlined,
            title: 'Phone',
            text: '8712-6271-72 / 0908-811-1674',
          ),
        ],
      ),
    );
  }

  Widget _contactRow({
    required IconData icon,
    required String title,
    required String text,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 39,
          height: 39,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: AppColors.primaryColor,
            size: 19,
          ),
        ),

        const SizedBox(width: 12),

        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: AppColors.titleColor,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),

              const SizedBox(height: 3),

              Text(
                text,
                style: const TextStyle(
                  color: Color(0xFF667085),
                  fontSize: 12,
                  height: 1.45,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ============================================================
  // CLOSING CARD
  // ============================================================

  Widget _buildClosingCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 22,
        vertical: 28,
      ),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(26),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryColor.withValues(alpha: 0.18),
            blurRadius: 22,
            offset: const Offset(0, 9),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.14),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.favorite_rounded,
              color: Colors.white,
              size: 26,
            ),
          ),

          const SizedBox(height: 13),

          const Text(
            'Faith in Action',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w900,
              letterSpacing: -0.3,
            ),
          ),

          const SizedBox(height: 7),

          Text(
            'Prayer • Compassion • Service • Community',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.78),
              fontSize: 11,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
            ),
          ),
        ],
      ),
    );
  }
}
