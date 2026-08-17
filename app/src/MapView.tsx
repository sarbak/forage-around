import { View, Text, StyleSheet } from "react-native";
import { Find } from "./lib";
import { C, F } from "./theme";

// Native placeholder. The web build resolves MapView.web.tsx (Leaflet) instead.
// Swap in react-native-maps here when building the iOS/Android app.
type Props = {
  center: { lat: number; lng: number };
  finds: Find[];
  onSelect: (f: Find) => void;
  showCenterMarker?: boolean;
  zoom?: number;
};

export default function MapView(_props: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Map coming to the app</Text>
      <Text style={styles.body}>
        The map view is live on the web version. Use the list for now.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 420,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
  },
  title: { fontFamily: F.display, fontSize: 20, color: C.ink, marginBottom: 6 },
  body: { fontSize: 14, color: C.inkSoft, textAlign: "center", lineHeight: 20 },
});
