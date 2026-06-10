import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: "#fff",
  },

  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },

  headerInfo: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#0E011A",
  },

  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },

  dateText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEE",

    shadowColor: "#000",
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
    color: "#0E011A",
  },

  questionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0E011A",
    flex: 1,
    lineHeight: 20,
  },

  requiredStar: {
    color: "#D32F2F",
    fontWeight: "bold",
  },

  infoText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },

  editProfile: {
    marginTop: 10,
  },

  editProfileText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },

  hintText: {
    fontSize: 13,
    color: "#777",
    marginBottom: 12,
    fontStyle: "italic",
    lineHeight: 18,
  },

  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#000",
    marginTop: 6,
  },

  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 14,
    marginTop: 4,
  },

  uploadBoxSuccess: {
    backgroundColor: "#E8F5E9",
    borderColor: "#A5D6A7",
    borderStyle: "solid",
  },

  uploadTextContainer: {
    marginLeft: 12,
    flex: 1,
  },

  uploadTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  uploadSubtitle: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 6,
  },

  optionRowSelected: {
    backgroundColor: "#F4F1F7",
    borderColor: "#E1DCE8",
  },

  optionLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: "#444",
    flex: 1,
  },

  optionLabelSelected: {
    fontWeight: "600",
    color: "#0E011A",
  },

  submitButton: {
    backgroundColor: "#0E011A",
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  lockTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
  },

  lockSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  loginButton: {
    backgroundColor: "#000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  loginButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
