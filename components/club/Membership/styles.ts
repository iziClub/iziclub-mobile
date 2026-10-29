import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

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
    fontWeight: "bold",
    marginBottom: 6,
    color: Colors.noir,
  },

  description: {
    fontSize: 14,
    color: Colors.gris,
    lineHeight: 20,
    marginBottom: 8,
  },

  dateText: {
    fontSize: 11,
    color: Colors.gris,
    fontStyle: "italic",
  },

  card: {
    backgroundColor: Colors.blanc,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.grisClair,

    shadowColor: Colors.noir,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
    color: Colors.noir,
  },

  questionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.noir,
    flex: 1,
    lineHeight: 20,
  },

  requiredStar: {
    color: Colors.rouge,
    fontWeight: "bold",
  },

  infoText: {
    fontSize: 14,
    color: Colors.noir,
    marginBottom: 4,
  },

  editProfile: {
    marginTop: 10,
  },

  editProfileText: {
    color: Colors.bleu,
    fontSize: 12,
    fontWeight: "600",
  },

  hintText: {
    fontSize: 13,
    color: Colors.gris,
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
    fontSize: 14,
    color: Colors.noir,
    marginTop: 6,
  },

  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blanc,
    borderWidth: 1,
    borderColor: Colors.grisClair,
    borderStyle: "dashed",
    borderRadius: 14,
    padding: 14,
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
    fontWeight: "600",
    color: Colors.noir,
  },

  uploadSubtitle: {
    fontSize: 11,
    color: Colors.gris,
    marginTop: 2,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 6,
  },

  optionRowSelected: {
    backgroundColor: Colors.bleuClair,
    borderColor: Colors.bleu,
  },

  optionLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.noir,
    flex: 1,
  },

  optionLabelSelected: {
    fontWeight: "600",
    color: Colors.bleu,
  },

  submitButton: {
    backgroundColor: Colors.noir,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 10,
  },

  submitButtonText: {
    color: Colors.blanc,
    fontSize: 16,
    fontWeight: "bold",
  },

  lockTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    color: Colors.noir,
  },

  lockSubtitle: {
    fontSize: 14,
    color: Colors.gris,
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
    fontWeight: "bold",
  },
});
