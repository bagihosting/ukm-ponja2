// Define types for profile data
export interface ProfileContent {
  about: string;
  vision: string;
  mission: string;
}

// Default content to be used if the profile document doesn't exist yet.
export const defaultProfileContent: ProfileContent = {
  about: "Unit Kegiatan Mahasiswa Pondok Lanjut Usia (UKM PONJA) adalah sebuah organisasi mahasiswa yang berdedikasi untuk memberikan kontribusi positif kepada masyarakat, khususnya para lansia. Kami percaya bahwa setiap individu, tanpa memandang usia, berhak mendapatkan kualitas hidup yang baik, perhatian, dan kebahagiaan.",
  vision: "Menjadi wadah bagi mahasiswa untuk mengembangkan kepedulian sosial dan menjadi pelopor dalam upaya peningkatan kesejahteraan lansia.",
  mission: "Menyelenggarakan kegiatan-kegiatan yang bermanfaat seperti pemeriksaan kesehatan rutin, senam bersama, penyuluhan, serta kegiatan rekreasi untuk menjaga kesehatan fisik dan mental para lansia."
};
