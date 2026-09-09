import 'package:flutter/material.dart';
import '../constants/app_colors.dart';

class AboutScreen extends StatelessWidget {
  final String userName;
  final String email;

  const AboutScreen({
    super.key,
    this.userName = 'Guest',
    this.email = '',
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundColor,
      appBar: AppBar(
        title: const Text('About Sto. Domingo Church'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(18, 18, 18, 30),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 820),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _hero(),
                const SizedBox(height: 16),
                _section(
                  'About the Church',
                  'Sto. Domingo Church, formally the National Shrine of Our Lady of the Holy Rosary of La Naval de Manila, is a Roman Catholic parish church and national shrine in Quezon City. The Dominican community established the original church in Intramuros in 1587, and the church was later transferred to its present Quezon Avenue location after World War II.',
                ),
                _section(
                  'Heritage & Identity',
                  'The Quezon City Government identifies Sto. Domingo Church as a National Cultural Treasure. Its heritage significance includes the work of National Artists Jose Zaragoza and Botong Francisco, along with works associated with Galo Ocampo, Antonio Garcia Llamas, and Francesco Monti. The declaration also recognizes the historic ivory image of Nuestra Señora del Santissimo Rosario.',
                ),
                _section(
                  'La Naval de Manila',
                  'The shrine is closely associated with Our Lady of the Most Holy Rosary, La Naval de Manila. The devotion is central to the parish and to the annual October celebration, which includes novena Masses, liturgical celebrations, and a grand procession.',
                ),
                const SizedBox(height: 6),
                const Text(
                  'Mission & Service',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: AppColors.titleColor,
                  ),
                ),
                const SizedBox(height: 10),
                _area(
                  'Faith & Worship',
                  Icons.church_rounded,
                  'Prayer, Mass, sacramental life, liturgical celebrations, and devotion.',
                ),
                _area(
                  'Community Formation',
                  Icons.groups_rounded,
                  'Formation and community activities that encourage participation and service.',
                ),
                _area(
                  'Youth Ministry',
                  Icons.school_rounded,
                  'Youth-focused formation and activities are documented in parish-related sources.',
                ),
                _area(
                  'Social Communications Ministry',
                  Icons.campaign_outlined,
                  'Parish communication and documentation of community activities.',
                ),
                _area(
                  'Parish Pastoral Council',
                  Icons.account_balance_outlined,
                  'Pastoral coordination and participation in parish activities.',
                ),
                _area(
                  'Barkadahan ni Santo Domingo',
                  Icons.diversity_3_rounded,
                  'A parish-related youth/community group documented in parish and academic sources.',
                ),
                _area(
                  'Basic Ecclesial Communities / Buklodasal',
                  Icons.home_work_outlined,
                  'Small faith communities that support participation and community life in the parish.',
                ),
                const SizedBox(height: 8),
                _note(),
                const SizedBox(height: 14),
                _location(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _hero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            AppColors.primaryDark,
            AppColors.primaryColor,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.church_rounded,
            color: Colors.white,
            size: 44,
          ),
          SizedBox(height: 13),
          Text(
            'Sto. Domingo Church',
            style: TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w900,
            ),
          ),
          SizedBox(height: 6),
          Text(
            'National Shrine of Our Lady of the Holy Rosary of La Naval de Manila',
            style: TextStyle(
              color: Colors.white70,
              height: 1.45,
            ),
          ),
        ],
      ),
    );
  }

  static Widget _section(
    String title,
    String text,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(19),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w900,
                color: AppColors.titleColor,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              text,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.subtitleColor,
                height: 1.55,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _area(
    String title,
    IconData icon,
    String text,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 9),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 5,
        ),
        leading: Container(
          width: 43,
          height: 43,
          decoration: BoxDecoration(
            color: AppColors.primaryLight,
            borderRadius: BorderRadius.circular(13),
          ),
          child: Icon(
            icon,
            color: AppColors.primaryColor,
          ),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w800,
            color: AppColors.titleColor,
          ),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 3),
          child: Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.subtitleColor,
              height: 1.4,
            ),
          ),
        ),
      ),
    );
  }

  static Widget _note() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: AppColors.surfaceBlue,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: AppColors.dividerColor,
        ),
      ),
      child: const Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.info_outline_rounded,
            color: AppColors.primaryColor,
          ),
          SizedBox(width: 10),
          Expanded(
            child: Text(
              'The organizations and ministry areas shown above are presented only when supported by available parish-related documentation. They are not claimed to be an official fixed list of exactly seven current parish ministries.',
              style: TextStyle(
                fontSize: 12,
                color: AppColors.subtitleColor,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }

  static Widget _location() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: AppColors.dividerColor,
        ),
      ),
      child: const Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Icon(
            Icons.location_on_outlined,
            color: AppColors.primaryColor,
            size: 24,
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  'Location',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.titleColor,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  '537 Quezon Avenue, Barangay Sto. Domingo, Quezon City',
                  style: TextStyle(
                    color: AppColors.subtitleColor,
                    height: 1.4,
                  ),
                ),
                SizedBox(height: 9),
                Text(
                  'Contact: 8712-6271-72 / 0908-811-1674',
                  style: TextStyle(
                    color: AppColors.subtitleColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
