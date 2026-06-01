import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
  TextInput,
  Image,
  Modal,
  Linking,
  ActivityIndicator,
  Platform,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import * as Location from "expo-location";
import {
  useFonts,
  Fraunces_400Regular,
  Fraunces_600SemiBold,
} from "@expo-google-fonts/fraunces";
import { C, F } from "./src/theme";
import {
  fetchNearby,
  applyView,
  fmtDist,
  walkMins,
  monthName,
  inSeasonNames,
  directionsUrl,
  geocode,
  fetchWikiInfo,
  Find,
  GeoPoint,
} from "./src/lib";
import MapView from "./src/MapView";

// Live Oak Park, Berkeley — generic fallback when location is unavailable.
const FALLBACK = { lat: 37.8814, lng: -122.2686, label: "Live Oak Park, Berkeley" };
const TEN_MIN_M = 810; // ~10 minutes at 1.35 m/s

type Loc = { lat: number; lng: number; label: string };

const MONTH = new Date().getMonth() + 1; // 1-12

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
  });
  const ready = Platform.OS === "web" || fontsLoaded || !!fontError;

  const [loc, setLoc] = useState<Loc | null>(null);
  const [finds, setFinds] = useState<Find[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [onlyInSeason, setOnlyInSeason] = useState(true);
  const [view, setView] = useState<"list" | "map">("list");
  const [selected, setSelected] = useState<Find | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const teaser = useMemo(() => inSeasonNames(MONTH, 4), []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  async function go(point: GeoPoint, wasDenied = false) {
    const f = await fetchNearby(point.lat, point.lng, MONTH);
    setDenied(wasDenied);
    setLoc(point);
    setFinds(f);
  }

  async function useAddress(query: string) {
    if (!query.trim()) return;
    setBusy(true);
    setGeoError(null);
    try {
      const point = await geocode(query);
      if (!point) {
        setGeoError("Couldn't find that address. Try adding the city.");
        return;
      }
      await go(point);
    } catch {
      setGeoError("Address lookup failed. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  async function locateMe() {
    setBusy(true);
    setGeoError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        await go(FALLBACK, true);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await go({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Your location" });
    } catch {
      await go(FALLBACK, true);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setLoc(null);
    setFinds(null);
    setView("list");
  }

  if (!ready) {
    return (
      <View style={[styles.app, styles.center]}>
        <ActivityIndicator color={C.forest} />
      </View>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar barStyle="dark-content" />
      {loc && finds ? (
        <Results
          loc={loc}
          finds={finds}
          denied={denied}
          onlyInSeason={onlyInSeason}
          setOnlyInSeason={setOnlyInSeason}
          view={view}
          setView={setView}
          onReset={reset}
          onSelect={setSelected}
        />
      ) : (
        <Landing
          teaser={teaser}
          busy={busy}
          geoError={geoError}
          onLocate={locateMe}
          onAddress={useAddress}
          onAbout={() => setAboutOpen(true)}
        />
      )}
      <Detail find={selected} onClose={() => setSelected(null)} />
      <About visible={aboutOpen} onClose={() => setAboutOpen(false)} />
    </View>
  );
}

/* ------------------------------- Landing ------------------------------- */

function Landing({
  teaser,
  busy,
  geoError,
  onLocate,
  onAddress,
  onAbout,
}: {
  teaser: string[];
  busy: boolean;
  geoError: string | null;
  onLocate: () => void;
  onAddress: (q: string) => void;
  onAbout: () => void;
}) {
  const [addr, setAddr] = useState("");
  return (
    <ScrollView contentContainerStyle={styles.landing} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.hero}>
        <Text style={styles.kicker}>FIELD GUIDE TO THE FREE HARVEST</Text>
        <Text style={styles.wordmark}>Forage{"\n"}Around</Text>
        <Text style={styles.tagline}>
          The fruit, herbs and greens growing wild and unpicked around you — what to make with them, and how to keep them.
        </Text>

        <Pressable
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
          onPress={onLocate}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Find fruit near me using your location"
        >
          {busy ? <ActivityIndicator color={C.white} /> : <Text style={styles.ctaText}>Find fruit near me</Text>}
        </Pressable>
        <Text style={styles.noLogin}>No login. Just your location, once.</Text>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or type an address</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.addrRow}>
          <TextInput
            style={styles.addrInput}
            placeholder="Live Oak Park, Berkeley"
            placeholderTextColor={C.inkSoft}
            value={addr}
            onChangeText={setAddr}
            onSubmitEditing={() => onAddress(addr)}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
          />
          <Pressable
            style={({ pressed }) => [styles.addrGo, pressed && styles.addrGoPressed]}
            onPress={() => onAddress(addr)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Search this address"
          >
            <Text style={styles.addrGoText}>Go</Text>
          </Pressable>
        </View>
        {!!geoError && <Text style={styles.geoError}>{geoError}</Text>}
      </View>

      <View style={styles.seasonCard}>
        <Text style={styles.seasonLabel}>Ripe right now · {monthName(MONTH)}</Text>
        <Text style={styles.seasonList}>
          {teaser.length ? teaser.join(" · ") : "the quiet season — mostly herbs and citrus"}
        </Text>
        <Text style={styles.seasonNote}>
          Knock on a neighbor's door before reaching over a fence. Take only what would otherwise fall.
        </Text>
      </View>

      <Pressable onPress={onAbout} accessibilityRole="button" style={styles.footLink}>
        <Text style={styles.footnote}>
          The story behind this, and credits ›
        </Text>
      </Pressable>
      <Text style={styles.footCredit}>
        Tree locations from Falling Fruit, used under CC BY-NC-SA.
      </Text>
    </ScrollView>
  );
}

/* ------------------------------- Results ------------------------------- */

function Results({
  loc,
  finds,
  denied,
  onlyInSeason,
  setOnlyInSeason,
  view,
  setView,
  onReset,
  onSelect,
}: {
  loc: Loc;
  finds: Find[];
  denied: boolean;
  onlyInSeason: boolean;
  setOnlyInSeason: (v: boolean) => void;
  view: "list" | "map";
  setView: (v: "list" | "map") => void;
  onReset: () => void;
  onSelect: (f: Find) => void;
}) {
  const shown = useMemo(() => applyView(finds, onlyInSeason), [finds, onlyInSeason]);
  const mapFinds = useMemo(() => {
    const base = onlyInSeason ? finds.filter((f) => f.inSeason || !f.seasonKnown) : finds;
    return base.filter((f) => f.distM <= TEN_MIN_M).slice(0, 150);
  }, [finds, onlyInSeason]);

  const inSeasonCount = finds.filter((f) => f.inSeason).length;
  const edibleCount = finds.length;

  const Header = (
    <View>
      <View style={styles.topbar}>
        <Pressable onPress={onReset} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back to start">
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <View style={styles.segment}>
          <Pressable
            onPress={() => setView("list")}
            style={[styles.segBtn, view === "list" && styles.segBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: view === "list" }}
          >
            <Text style={[styles.segText, view === "list" && styles.segTextOn]}>List</Text>
          </Pressable>
          <Pressable
            onPress={() => setView("map")}
            style={[styles.segBtn, view === "map" && styles.segBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: view === "map" }}
          >
            <Text style={[styles.segText, view === "map" && styles.segTextOn]}>Map</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.locLabel}>{loc.label}</Text>
      {denied && <Text style={styles.deniedNote}>Location off — showing Live Oak Park. Tap back to retry.</Text>}

      <Text style={styles.resultsH}>
        {view === "map"
          ? `${mapFinds.length} within a 10-min walk`
          : onlyInSeason
          ? `${shown.length} ripe near you`
          : `${edibleCount} edible nearby · ${inSeasonCount} ripe now`}
      </Text>

      <View style={styles.toggleRow}>
        <Chip label={`Ripe now · ${monthName(MONTH)}`} active={onlyInSeason} onPress={() => setOnlyInSeason(true)} />
        <Chip label="Everything edible" active={!onlyInSeason} onPress={() => setOnlyInSeason(false)} />
      </View>
    </View>
  );

  if (view === "map") {
    return (
      <ScrollView contentContainerStyle={styles.listPad} showsVerticalScrollIndicator={false}>
        {Header}
        <View style={styles.mapWrap}>
          <MapView center={{ lat: loc.lat, lng: loc.lng }} finds={mapFinds} onSelect={onSelect} />
        </View>
        <Text style={styles.mapHint}>Tap a pin to see how to use & keep it.</Text>
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={shown}
      keyExtractor={(f) => f.id}
      contentContainerStyle={styles.listPad}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={Header}
      renderItem={({ item }) => <Card find={item} onSelect={onSelect} />}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Nothing ripe within reach this month. Try “Everything edible” to see what's coming.
        </Text>
      }
    />
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

function seasonRange(find: Find): string {
  const s = find.species.season;
  if (!find.seasonKnown) return "EDIBLE";
  if (!s.length) return "year-round";
  return `${monthName(s[0])}–${monthName(s[s.length - 1])}`;
}

function Card({ find, onSelect }: { find: Find; onSelect: (f: Find) => void }) {
  const { species } = find;
  const badgeStyle = find.atPeak ? styles.badgePeak : find.inSeason ? styles.badgeSeason : styles.badgeOff;
  const badgeTextStyle = find.atPeak ? styles.badgeTextPeak : find.inSeason ? styles.badgeTextSeason : styles.badgeTextOff;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onSelect(find)}
      accessibilityRole="button"
      accessibilityLabel={`${find.type}, ${fmtDist(find.distM)} away. See how to use it.`}
    >
      {find.images[0] ? (
        <Image source={{ uri: find.images[0] }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbEmoji]}>
          <Text style={{ fontSize: 26 }}>{species.emoji}</Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={styles.cardName}>{find.type}</Text>
        <Text style={styles.cardMeta}>
          {species.part} · {fmtDist(find.distM)} · {walkMins(find.distM)} min
        </Text>
        {!!species.note && (
          <Text style={styles.cardNote} numberOfLines={2}>
            {species.note}
          </Text>
        )}
      </View>
      <View style={styles.cardRight}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>
            {find.atPeak ? "PEAK" : find.inSeason ? "RIPE" : seasonRange(find)}
          </Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </View>
    </Pressable>
  );
}

/* -------------------------------- Detail ------------------------------- */

function Detail({ find, onClose }: { find: Find | null; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const [info, setInfo] = useState<{ image?: string; about?: string }>({});

  useEffect(() => {
    setInfo({});
    if (!find?.wiki) return;
    let cancelled = false;
    fetchWikiInfo(find.wiki).then((r) => {
      if (!cancelled) setInfo(r);
    });
    return () => {
      cancelled = true;
    };
  }, [find]);

  if (!find) return null;
  const { species } = find;
  const heroW = Math.min(width, 600) - 36;
  // Curated photos first; otherwise the photo pulled live from Wikipedia.
  const heroImages = find.images.length ? find.images : info.image ? [info.image] : [];
  const open = () => Linking.openURL(directionsUrl(find.lat, find.lng, find.type));

  return (
    <Modal visible={!!find} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.app}>
        <ScrollView contentContainerStyle={styles.detailPad} showsVerticalScrollIndicator={false}>
          <View style={styles.detailTop}>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {heroImages.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              style={styles.hero}
              contentContainerStyle={{ gap: 10 }}
            >
              {heroImages.map((uri) => (
                <Image key={uri} source={{ uri }} style={[styles.heroImg, { width: heroW }]} />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.heroEmoji, { width: heroW }]}>
              <Text style={{ fontSize: 72 }}>{species.emoji}</Text>
            </View>
          )}

          <Text style={styles.detailName}>{find.type}</Text>
          <Text style={styles.detailSub}>
            {species.part}
            {species.cat && species.cat !== "other" ? ` · ${species.cat}` : ""}
          </Text>

          <View style={styles.detailChips}>
            <View
              style={[
                styles.dChip,
                find.atPeak ? styles.badgePeak : find.inSeason ? styles.badgeSeason : styles.badgeOff,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  find.atPeak ? styles.badgeTextPeak : find.inSeason ? styles.badgeTextSeason : styles.badgeTextOff,
                ]}
              >
                {find.atPeak ? "AT PEAK NOW" : find.inSeason ? "RIPE NOW" : seasonRange(find)}
              </Text>
            </View>
            <View style={[styles.dChip, styles.dChipPlain]}>
              <Text style={styles.dChipText}>
                {fmtDist(find.distM)} · {walkMins(find.distM)} min walk
              </Text>
            </View>
          </View>

          {!!species.note && <Text style={styles.detailNote}>{species.note}</Text>}

          {!!info.about && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: C.inkSoft }]}>ABOUT</Text>
              <Text style={styles.aboutText}>{info.about}</Text>
            </View>
          )}

          {species.uses.length > 0 && (
            <Section title="Ways to eat & use" items={species.uses} accent={C.forest} />
          )}
          {species.preserve.length > 0 && (
            <Section title="Ways to keep it" items={species.preserve} accent={C.ripe} />
          )}

          {species.uses.length === 0 && species.preserve.length === 0 && (
            <Text style={styles.detailNote}>
              We haven't written prep notes for this one yet — check the description above, and always
              confirm the ID yourself before eating.
            </Text>
          )}

          <Pressable
            style={({ pressed }) => [styles.walkBtn, pressed && styles.ctaPressed]}
            onPress={open}
            accessibilityRole="button"
            accessibilityLabel="Open walking directions"
          >
            <Text style={styles.ctaText}>Walk here ›</Text>
          </Pressable>

          <Text style={styles.safety}>
            Forage responsibly: confirm the ID yourself, take only from public land or with permission, and
            never eat anything you're unsure of.
          </Text>
          <Text style={styles.attribution}>
            Photo & description via Wikipedia · Location from Falling Fruit (CC BY-NC-SA),
            crowd-sourced and provided as-is — confirm before foraging.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Link({ label, url }: { label: string; url: string }) {
  return (
    <Text style={styles.link} onPress={() => Linking.openURL(url)} accessibilityRole="link">
      {label}
    </Text>
  );
}

function About({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View style={styles.app}>
        <ScrollView contentContainerStyle={styles.detailPad} showsVerticalScrollIndicator={false}>
          <View style={styles.detailTop}>
            <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.detailName}>Why this exists</Text>

          <Text style={styles.aboutPara}>
            I moved to Berkeley about nine months ago and got into fermentation around the same
            time. Walking around, I kept noticing how much fruit grows wild and unpicked right on
            the sidewalk: loquats, plums, figs, lemons, mostly going to the birds or the pavement.
          </Text>
          <Text style={styles.aboutPara}>
            I wanted a simple way to see what was ripe near me and what I could make with it, so I
            built this for myself on top of Falling Fruit's lovely open map. I'm sharing it in case
            your neighborhood is as quietly generous as mine.
          </Text>
          <Text style={styles.aboutPara}>
            Take only what would otherwise fall, knock before reaching over a fence, and always
            leave plenty for the birds and the next person.
          </Text>

          <Text style={[styles.sectionTitle, { color: C.inkSoft, marginTop: 28 }]}>
            WHERE THE DATA COMES FROM
          </Text>
          <Text style={styles.aboutPara}>
            The map of trees comes from <Link label="Falling Fruit" url="https://fallingfruit.org" />,
            a nonprofit, volunteer-run map of the urban harvest. Their locations are used here under
            the <Link label="CC BY-NC-SA license" url="https://creativecommons.org/licenses/by-nc-sa/4.0/" />.
            I've added the season windows, the ways to use each plant, and the preservation ideas;
            the locations are theirs and are crowd-sourced, so treat them as a starting point, not
            gospel.
          </Text>
          <Text style={styles.aboutPara}>
            Plant photos and descriptions come from{" "}
            <Link label="Wikipedia" url="https://en.wikipedia.org" />. The map uses{" "}
            <Link label="OpenStreetMap" url="https://www.openstreetmap.org/copyright" />.
          </Text>
          <Text style={styles.aboutPara}>
            Forage Around is free and non-commercial, and it's{" "}
            <Link label="open-source on GitHub" url="https://github.com/sarbak/forage-around" />.
          </Text>

          <Text style={styles.safety}>
            This is a discovery aid, not an identification authority. Always confirm a plant's
            identity yourself before eating anything, and only harvest from public land or with
            permission.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Section({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: accent }]}>{title.toUpperCase()}</Text>
      {items.map((it, i) => (
        <View key={i} style={styles.listItem}>
          <View style={[styles.dot, { backgroundColor: accent }]} />
          <Text style={styles.listItemText}>{it}</Text>
        </View>
      ))}
    </View>
  );
}

/* -------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: C.paper,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0,
  },
  center: { alignItems: "center", justifyContent: "center" },

  /* Landing */
  landing: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 72, paddingBottom: 40, maxWidth: 560, alignSelf: "center", width: "100%" },
  hero: { marginBottom: 36 },
  kicker: { fontSize: 11, letterSpacing: 2, color: C.ripe, fontWeight: "700", marginBottom: 14 },
  wordmark: { fontFamily: F.display, fontSize: 72, lineHeight: 76, color: C.forest, letterSpacing: -1 },
  tagline: { fontSize: 18, lineHeight: 27, color: C.inkSoft, marginTop: 14, marginBottom: 30, maxWidth: 440 },
  cta: {
    backgroundColor: C.forest,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: C.forest,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  ctaPressed: { backgroundColor: "#264E30" },
  ctaText: { color: C.white, fontSize: 18, fontWeight: "700", fontFamily: F.display },
  noLogin: { textAlign: "center", color: C.inkSoft, fontSize: 13, marginTop: 12 },

  orRow: { flexDirection: "row", alignItems: "center", marginTop: 22, marginBottom: 14, gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: C.line },
  orText: { fontSize: 12, color: C.inkSoft, letterSpacing: 0.3 },
  addrRow: { flexDirection: "row", gap: 10 },
  addrInput: {
    flex: 1,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: C.ink,
  },
  addrGo: { backgroundColor: C.ripe, borderRadius: 14, paddingHorizontal: 22, alignItems: "center", justifyContent: "center" },
  addrGoPressed: { backgroundColor: "#BB601F" },
  addrGoText: { color: C.white, fontSize: 16, fontWeight: "700", fontFamily: F.display },
  geoError: { color: C.berry, fontSize: 13, marginTop: 10, lineHeight: 19 },

  seasonCard: { backgroundColor: C.white, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: C.line },
  seasonLabel: { fontSize: 12, letterSpacing: 1.5, color: C.ripe, fontWeight: "700", marginBottom: 8 },
  seasonList: { fontFamily: F.display, fontSize: 24, lineHeight: 32, color: C.ink, textTransform: "capitalize", marginBottom: 12 },
  seasonNote: { fontSize: 14, lineHeight: 21, color: C.inkSoft },
  footLink: { marginTop: 28, alignSelf: "center" },
  footnote: { fontSize: 13, color: C.forest, textAlign: "center", fontWeight: "600" },
  footCredit: { marginTop: 8, fontSize: 11.5, color: C.inkSoft, textAlign: "center" },
  aboutPara: { fontSize: 16, lineHeight: 24, color: C.ink, marginTop: 14 },
  link: { color: C.forest, fontWeight: "700", textDecorationLine: "underline" },

  /* Results */
  listPad: { paddingHorizontal: 18, paddingBottom: 48, paddingTop: 18, maxWidth: 600, alignSelf: "center", width: "100%" },
  topbar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  back: { fontFamily: F.display, fontSize: 22, color: C.forest },
  segment: { flexDirection: "row", backgroundColor: C.paperDeep, borderRadius: 999, padding: 3 },
  segBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 999 },
  segBtnOn: { backgroundColor: C.white, shadowColor: C.shadow, shadowOpacity: 1, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },
  segText: { fontSize: 14, fontWeight: "600", color: C.inkSoft },
  segTextOn: { color: C.forest },
  locLabel: { fontSize: 13, color: C.inkSoft, marginBottom: 8 },
  deniedNote: { fontSize: 13, color: C.berry, marginBottom: 12, lineHeight: 19 },
  resultsH: { fontFamily: F.display, fontSize: 30, lineHeight: 36, color: C.ink, marginBottom: 16 },
  toggleRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  chip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1 },
  chipOn: { backgroundColor: C.forest, borderColor: C.forest },
  chipOff: { backgroundColor: "transparent", borderColor: C.line },
  chipText: { fontSize: 14, fontWeight: "600", color: C.inkSoft },
  chipTextOn: { color: C.white },

  mapWrap: { height: 460, borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: C.line, backgroundColor: C.white },
  mapHint: { fontSize: 13, color: C.inkSoft, textAlign: "center", marginTop: 12 },

  /* Card */
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: C.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.line,
  },
  cardPressed: { backgroundColor: C.paperDeep },
  thumb: { width: 60, height: 60, borderRadius: 12, backgroundColor: C.paperDeep },
  thumbEmoji: { alignItems: "center", justifyContent: "center" },
  cardName: { fontFamily: F.display, fontSize: 19, color: C.ink },
  cardMeta: { fontSize: 13, color: C.inkSoft, marginTop: 2 },
  cardNote: { fontSize: 12.5, color: C.inkSoft, marginTop: 5, lineHeight: 17 },
  cardRight: { alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" },
  chev: { fontSize: 22, color: C.line, marginTop: 8 },

  badge: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, alignSelf: "flex-start" },
  badgePeak: { backgroundColor: C.ripe },
  badgeSeason: { backgroundColor: C.forestSoft },
  badgeOff: { backgroundColor: C.paperDeep },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  badgeTextPeak: { color: C.white },
  badgeTextSeason: { color: C.forest },
  badgeTextOff: { color: C.inkSoft },

  empty: { textAlign: "center", color: C.inkSoft, fontSize: 15, lineHeight: 22, marginTop: 40, paddingHorizontal: 20 },

  /* Detail */
  detailPad: { paddingHorizontal: 18, paddingBottom: 48, paddingTop: 14, maxWidth: 600, alignSelf: "center", width: "100%" },
  detailTop: { flexDirection: "row", justifyContent: "flex-start", marginBottom: 10 },
  close: { fontSize: 20, color: C.ink, fontWeight: "700" },
  heroImg: { height: 230, borderRadius: 18, backgroundColor: C.paperDeep },
  heroEmoji: { height: 200, borderRadius: 18, backgroundColor: C.forestSoft, alignItems: "center", justifyContent: "center" },
  detailName: { fontFamily: F.display, fontSize: 34, lineHeight: 40, color: C.ink, marginTop: 18 },
  detailSub: { fontSize: 14, color: C.inkSoft, marginTop: 4, textTransform: "capitalize" },
  detailChips: { flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" },
  dChip: { paddingVertical: 6, paddingHorizontal: 11, borderRadius: 9 },
  dChipPlain: { backgroundColor: C.paperDeep },
  dChipText: { fontSize: 12, fontWeight: "700", color: C.inkSoft },
  detailNote: { fontSize: 15, lineHeight: 22, color: C.inkSoft, marginTop: 16 },
  aboutText: { fontSize: 15, lineHeight: 22, color: C.ink },

  section: { marginTop: 24 },
  sectionTitle: { fontSize: 12, letterSpacing: 1.4, fontWeight: "800", marginBottom: 10 },
  listItem: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 9 },
  dot: { width: 7, height: 7, borderRadius: 4, marginTop: 7 },
  listItemText: { flex: 1, fontSize: 15.5, lineHeight: 22, color: C.ink },

  walkBtn: { backgroundColor: C.forest, paddingVertical: 16, borderRadius: 14, alignItems: "center", marginTop: 28 },
  safety: { fontSize: 12.5, lineHeight: 18, color: C.inkSoft, marginTop: 18, fontStyle: "italic" },
  attribution: { fontSize: 11.5, color: C.inkSoft, marginTop: 12, textAlign: "center" },
});
