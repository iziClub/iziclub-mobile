import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: Colors.fond,
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    backgroundColor: Colors.fond,
  },

  headerInfo: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontFamily: Fonts.titre,
    marginBottom: 8,
    color: Colors.noir,
  },

  description: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    lineHeight: 20,
    marginBottom: 8,
  },

  dateText: {
    fontSize: 12, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    fontStyle: "italic",
  },

  card: {
    backgroundColor: Colors.blanc,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    marginLeft: 8,
    color: Colors.noir,
  },

  questionTitle: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.noir,
    flex: 1,
    lineHeight: 20,
  },

  requiredStar: {
    color: Colors.rouge,
    fontFamily: Fonts.medium,
  },

  infoText: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.noir,
    marginBottom: 4,
  },

  editProfile: {
    marginTop: 12,
  },

  editProfileText: {
    color: Colors.bleu,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },

  hintText: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    marginBottom: 12,
    fontStyle: "italic",
    lineHeight: 18,
  },

  input: {
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    borderRadius: 12,
    padding: 12,
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.noir,
    marginTop: 8,
  },

  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },

  uploadBoxSuccess: {
    backgroundColor: Colors.vertClair,
    borderColor: Colors.vert,
    borderStyle: "solid",
  },

  uploadTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  uploadTitle: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.noir,
  },

  uploadSubtitle: {
    fontSize: 12, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    marginTop: 2,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 8,
  },

  optionRowSelected: {
    backgroundColor: Colors.bleuClair,
    borderColor: Colors.noir,
  },

  optionLabel: {
    marginLeft: 12,
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.noir,
    flex: 1,
  },

  optionLabelSelected: {
    fontFamily: Fonts.medium,
    color: Colors.noir,
  },

  submitButton: {
    backgroundColor: Colors.noir,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 12,
  },

  submitButtonText: {
    color: Colors.blanc,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },

  lockTitle: {
    fontSize: 18,
    fontFamily: Fonts.titre,
    marginTop: 20,
    textAlign: "center",
    color: Colors.noir,
  },

  lockSubtitle: {
    fontSize: 14, fontFamily: Fonts.regular,
    color: Colors.grisTexte,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  loginButton: {
    backgroundColor: Colors.noir,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },

  loginButtonText: {
    color: Colors.blanc,
    fontFamily: Fonts.medium,
  },
});
