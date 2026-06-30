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
  inSeasonWithImages,
  directionsUrl,
  geocode,
  fetchWikiInfo,
  Find,
  GeoPoint,
} from "./src/lib";
import MapView from "./src/MapView";
import { track } from "./src/analytics";
import * as ImagePicker from "expo-image-picker";
import {
  communityEnabled,
  getRecentSubmissions,
  uploadPhoto,
  submit,
  Submission,
} from "./src/community";

type SubmitTarget = {
  kind: "observation" | "new_tree";
  source: "walk_here" | "wall";
  map_source?: string | null;
  ff_location_id?: string | null;
  species?: string | null;
  lat?: number | null;
  lng?: number | null;
} | null;

const ffIdOf = (f: Find) => f.id.split("-")[0];
const REFERRAL_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "ref",
] as const;

type ReferralParamKey = (typeof REFERRAL_PARAM_KEYS)[number];
type ReferralParams = Partial<Record<ReferralParamKey, string>>;

function cleanSource(value: string | null, maxLength = 40): string | null {
  if (!value) return null;
  const v = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, maxLength);
  if (!/^[a-z0-9_]+$/.test(v)) return null;
  return v;
}

function inferSourceFromPath(pathname: string): string | null {
  if (pathname === "/" || pathname === "") return "home";
  if (pathname.startsWith("/locations")) return "locations";
  if (pathname.startsWith("/seasonal-guide")) return "seasonal_guide";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/species/")) return "species";
  if (pathname.startsWith("/tree/")) return "tree";
  return null;
}

function readMapSource(): string | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  try {
    const url = new URL(window.location.href);
    const direct = cleanSource(
      url.searchParams.get("map_source") ||
        url.searchParams.get("source") ||
        url.searchParams.get("from")
    );
    if (direct) {
      window.sessionStorage?.setItem("forage_map_source", direct);
      return direct;
    }

    const stored = cleanSource(window.sessionStorage?.getItem("forage_map_source") || null);
    if (stored) return stored;

    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.host === window.location.host) return inferSourceFromPath(ref.pathname);
    }
  } catch {}
  return null;
}

function readReferralParams(): ReferralParams {
  if (Platform.OS !== "web" || typeof window === "undefined") return {};
  try {
    const url = new URL(window.location.href);
    const params = REFERRAL_PARAM_KEYS.reduce<ReferralParams>((acc, key) => {
      const value = cleanSource(url.searchParams.get(key), 80);
      if (value) acc[key] = value;
      return acc;
    }, {});
    if (Object.keys(params).length > 0) {
      window.sessionStorage?.setItem("forage_referral_params", JSON.stringify(params));
      return params;
    }

    const stored = window.sessionStorage?.getItem("forage_referral_params");
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, unknown>;
    return REFERRAL_PARAM_KEYS.reduce<ReferralParams>((acc, key) => {
      const raw = typeof parsed[key] === "string" ? parsed[key] : null;
      const value = cleanSource(raw, 80);
      if (value) acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
}

function withMapSource(
  source: string | null,
  props: Record<string, unknown>,
  referralParams: ReferralParams = {}
) {
  return {
    ...props,
    ...(source ? { map_source: source } : {}),
    ...referralParams,
  };
}

// Live Oak Park — generic fallback when location is unavailable.
const FALLBACK = { lat: 37.8814, lng: -122.2686, label: "Live Oak Park" };
const TEN_MIN_M = 810; // ~10 minutes at 1.35 m/s
const SUPPORT_EMAIL = "foragearound@mail.tin.computer";

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
  const [submitTarget, setSubmitTarget] = useState<SubmitTarget>(null);
  const [wallKey, setWallKey] = useState(0);
  const [mapSource] = useState(() => readMapSource());
  const [referralParams] = useState(() => readReferralParams());

  const teaser = useMemo(() => inSeasonNames(MONTH, 4), []);
  const ripeNow = useMemo(() => inSeasonWithImages(MONTH, 8), []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  async function go(point: GeoPoint, opts: { method: string; denied?: boolean }) {
    const f = await fetchNearby(point.lat, point.lng, MONTH);
    track(
      "location_resolved",
      withMapSource(mapSource, {
        method: opts.method,
        denied: !!opts.denied,
        ripe_count: f.filter((x) => x.inSeason).length,
        edible_count: f.length,
      }, referralParams)
    );
    setDenied(!!opts.denied);
    setLoc(point);
    setFinds(f);
  }

  async function useAddress(query: string) {
    if (!query.trim()) return;
    track("address_submitted", { form_location: "hero" });
    setBusy(true);
    setGeoError(null);
    try {
      const point = await geocode(query);
      if (!point) {
        setGeoError("Couldn't find that address. Try adding the city.");
        track("address_not_found");
        return;
      }
      await go(point, { method: "address" });
    } catch {
      setGeoError("Address lookup failed. Check your connection.");
      track("address_error");
    } finally {
      setBusy(false);
    }
  }

  async function locateMe() {
    track("locate_clicked", { form_location: "hero" });
    setBusy(true);
    setGeoError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        track("geolocation_denied");
        await go(FALLBACK, { method: "fallback", denied: true });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await go(
        { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Your location" },
        { method: "geolocation" }
      );
    } catch {
      await go(FALLBACK, { method: "fallback", denied: true });
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setLoc(null);
    setFinds(null);
    setView("list");
  }

  function handleSelect(f: Find) {
    track(
      "find_opened",
      withMapSource(mapSource, {
        species: f.type,
        ff_location_id: ffIdOf(f),
        distance_m: Math.round(f.distM),
        in_season: f.inSeason,
        season_known: f.seasonKnown,
      }, referralParams)
    );
    setSelected(f);
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
          onSelect={handleSelect}
          wallKey={wallKey}
          onSubmitOwn={() => {
            track(
              "submit_opened",
              withMapSource(
                mapSource,
                { kind: "new_tree", source: "wall" },
                referralParams
              )
            );
            setSubmitTarget({
              kind: "new_tree",
              source: "wall",
              map_source: mapSource,
              lat: loc.lat,
              lng: loc.lng,
            });
          }}
        />
      ) : (
        <Landing
          teaser={teaser}
          ripeNow={ripeNow}
          busy={busy}
          geoError={geoError}
          onLocate={locateMe}
          onAddress={useAddress}
          onAbout={() => {
            track("about_opened");
            setAboutOpen(true);
          }}
        />
      )}
      <Detail
        find={selected}
        mapSource={mapSource}
        referralParams={referralParams}
        onClose={() => setSelected(null)}
        onWalk={(f) => {
          track(
            "submit_opened",
            withMapSource(mapSource, {
              kind: "observation",
              source: "walk_here",
              species: f.type,
              ff_location_id: ffIdOf(f),
            }, referralParams)
          );
          setSelected(null);
          setSubmitTarget({
            kind: "observation",
            source: "walk_here",
            map_source: mapSource,
            ff_location_id: ffIdOf(f),
            species: f.type,
            lat: f.lat,
            lng: f.lng,
          });
        }}
      />
      <About visible={aboutOpen} onClose={() => setAboutOpen(false)} />
      <SubmitModal
        target={submitTarget}
        referralParams={referralParams}
        onClose={() => setSubmitTarget(null)}
        onDone={() => setWallKey((k) => k + 1)}
      />
    </View>
  );
}

/* ------------------------------- Landing ------------------------------- */

function Landing({
  teaser,
  ripeNow,
  busy,
  geoError,
  onLocate,
  onAddress,
  onAbout,
}: {
  teaser: string[];
  ripeNow: { name: string; image?: string; emoji: string }[];
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
          Reported fruit, herbs and greens near you, with season and source notes to check before you pick.
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

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or type an address</Text>
          <View style={styles.orLine} />
        </View>

        <View style={styles.addrRow}>
          <TextInput
            style={styles.addrInput}
            placeholder="Enter an address or place"
            placeholderTextColor={C.inkSoft}
            value={addr}
            onChangeText={setAddr}
            onFocus={() => track("address_input_focused", { form_location: "hero" })}
            onSubmitEditing={() => onAddress(addr)}
            returnKeyType="search"
            autoCapitalize="words"
            autoCorrect={false}
            accessibilityLabel="Address or place"
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
        <Text style={styles.seasonLabel}>Likely in season · {monthName(MONTH)}</Text>
        {ripeNow.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.ripeStrip}
            contentContainerStyle={{ gap: 12, paddingVertical: 2 }}
          >
            {ripeNow.map((r) => (
              <View key={r.name} style={styles.ripeTile}>
                {r.image ? (
                  <Image
                    source={{ uri: r.image }}
                    style={styles.ripeImg}
                    resizeMode="cover"
                    accessibilityLabel={r.name}
                  />
                ) : (
                  <View style={[styles.ripeImg, styles.ripeEmoji]}>
                    <Text style={{ fontSize: 30 }}>{r.emoji}</Text>
                  </View>
                )}
                <Text style={styles.ripeName} numberOfLines={1}>
                  {r.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.seasonList}>the quiet season — mostly herbs and citrus</Text>
        )}
        <Text style={styles.seasonNote}>
          Knock on a neighbor's door before reaching over a fence. Take only what would otherwise fall.
        </Text>
      </View>

      <Pressable onPress={onAbout} accessibilityRole="button" style={styles.footLink}>
        <Text style={styles.footnote}>
          Where the data comes from, and credits ›
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
  wallKey,
  onSubmitOwn,
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
  wallKey: number;
  onSubmitOwn: () => void;
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
            onPress={() => {
              track("view_toggled", { view: "list" });
              setView("list");
            }}
            style={[styles.segBtn, view === "list" && styles.segBtnOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: view === "list" }}
          >
            <Text style={[styles.segText, view === "list" && styles.segTextOn]}>List</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              track("view_toggled", { view: "map" });
              setView("map");
            }}
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
          ? `${inSeasonCount} likely in season near you`
          : `${edibleCount} edible nearby · ${inSeasonCount} likely in season`}
      </Text>

      <View style={styles.toggleRow}>
        <Chip
          label={`Likely in season · ${monthName(MONTH)}`}
          active={onlyInSeason}
          onPress={() => {
            track("season_toggled", { only_in_season: true });
            setOnlyInSeason(true);
          }}
        />
        <Chip
          label="Everything edible"
          active={!onlyInSeason}
          onPress={() => {
            track("season_toggled", { only_in_season: false });
            setOnlyInSeason(false);
          }}
        />
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
        <PhotoWall refreshKey={wallKey} onSubmit={onSubmitOwn} />
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
          Nothing likely in season within reach this month. Try “Everything edible” to see what's coming.
        </Text>
      }
      ListFooterComponent={<PhotoWall refreshKey={wallKey} onSubmit={onSubmitOwn} />}
    />
  );
}

/* ----------------------------- Community ------------------------------- */

function PhotoWall({ refreshKey, onSubmit }: { refreshKey: number; onSubmit: () => void }) {
  const [items, setItems] = useState<Submission[]>([]);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let cancelled = false;
    getRecentSubmissions(limit).then((r) => {
      if (!cancelled) {
        setItems(r);
        track("photo_wall_viewed", { count: r.length });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [refreshKey, limit]);

  if (!communityEnabled) return null;

  return (
    <View style={styles.wall}>
      <Text style={styles.wallTitle}>What foragers found</Text>
      {items.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingVertical: 2 }}
        >
          {items.map((s) => (
            <View key={s.id} style={styles.wallTile}>
              {s.photo_url ? (
                <Image
                  source={{ uri: s.photo_url }}
                  style={styles.wallImg}
                  resizeMode="cover"
                  accessibilityLabel={s.species || "Forager-submitted plant photo"}
                />
              ) : (
                <View style={[styles.wallImg, styles.wallImgEmpty]}>
                  <Text style={{ fontSize: 26 }}>🧺</Text>
                </View>
              )}
              {!!(s.species || s.plan || s.note) && (
                <Text style={styles.wallCaption} numberOfLines={2}>
                  {s.species ? `${s.species}. ` : ""}
                  {s.plan || s.note || ""}
                </Text>
              )}
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.wallEmpty}>
          No shares yet. Be the first to post what you found and what you made.
        </Text>
      )}
      <View style={styles.wallActions}>
        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [styles.wallBtn, pressed && styles.ctaPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.wallBtnText}>＋ Submit your own photos</Text>
        </Pressable>
        {items.length >= limit && (
          <Pressable
            onPress={() => {
              track("wall_see_all");
              setLimit((l) => l + 30);
            }}
            accessibilityRole="button"
          >
            <Text style={styles.wallSeeAll}>See all</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SubmitModal({
  target,
  referralParams,
  onClose,
  onDone,
}: {
  target: SubmitTarget;
  referralParams: ReferralParams;
  onClose: () => void;
  onDone: () => void;
}) {
  const [photo, setPhoto] = useState<{ base64: string; mime: string; uri: string } | null>(null);
  const [note, setNote] = useState("");
  const [plan, setPlan] = useState("");
  const [name, setName] = useState("");
  const [contributeFF, setContributeFF] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!target) return null;
  const t = target;
  const isNewTree = t.kind === "new_tree";

  function reset() {
    setPhoto(null);
    setNote("");
    setPlan("");
    setName("");
    setContributeFF(false);
    setDone(false);
    setErr(null);
  }

  async function pick() {
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });
    if (!res.canceled && res.assets[0]?.base64) {
      const a = res.assets[0];
      setPhoto({ base64: a.base64 as string, mime: a.mimeType || "image/jpeg", uri: a.uri });
      track("submit_photo_added", { kind: t.kind });
    }
  }

  async function send() {
    const submissionContext = withMapSource(t.map_source ?? null, {
      kind: t.kind,
      source: t.source,
      species: t.species ?? null,
      ff_location_id: t.ff_location_id ?? null,
      has_photo: !!photo,
      contribute_to_ff: isNewTree && contributeFF,
    }, referralParams);
    track("submit_submitted", submissionContext);
    setBusy(true);
    setErr(null);
    try {
      let photo_url: string | null = null;
      if (photo) {
        photo_url = await uploadPhoto(photo.base64, photo.mime);
        if (!photo_url) {
          track("submit_error", { kind: t.kind, stage: "upload" });
          setErr("Photo upload failed. Try a smaller image, or post without one.");
          setBusy(false);
          return;
        }
      }
      const ok = await submit({
        kind: t.kind,
        ff_location_id: t.ff_location_id ?? null,
        species: t.species ?? null,
        lat: t.lat ?? null,
        lng: t.lng ?? null,
        note: note.trim() || null,
        plan: plan.trim() || null,
        photo_url,
        author_name: name.trim() || null,
        contribute_to_ff: isNewTree && contributeFF,
      });
      if (ok) {
        track("submit_success", submissionContext);
        setDone(true);
        onDone();
      } else {
        track("submit_error", { kind: t.kind, stage: "insert" });
        setErr("Couldn't submit. Please try again.");
      }
    } catch {
      track("submit_error", { kind: t.kind, stage: "exception" });
      setErr("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={!!target} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.app}>
        <ScrollView contentContainerStyle={styles.detailPad} keyboardShouldPersistTaps="handled">
          <View style={styles.detailTop}>
            <Pressable
              onPress={() => {
                reset();
                onClose();
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          {done ? (
            <View style={{ paddingVertical: 40 }}>
              <Text style={styles.detailName}>Thank you 🧺</Text>
              <Text style={styles.aboutPara}>
                Your post is in. We give every submission a quick look before it shows up on the
                map, so others can see it soon.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.walkBtn, pressed && styles.ctaPressed]}
                onPress={() => {
                  reset();
                  onClose();
                }}
                accessibilityRole="button"
              >
                <Text style={styles.ctaText}>Done</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={styles.detailName}>
                {isNewTree ? "Add a spot" : `How did it go?`}
              </Text>
              <Text style={styles.aboutByline}>
                {target.species ? `${target.species} · ` : ""}
                {isNewTree
                  ? "Share a tree you found here."
                  : "Share a photo, a note, and what you're making."}
              </Text>

              <Pressable style={styles.photoPick} onPress={pick} accessibilityRole="button">
                {photo ? (
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                    accessibilityLabel="Selected submission photo"
                  />
                ) : (
                  <Text style={styles.photoPickText}>📷 Add a photo</Text>
                )}
              </Pressable>

              <TextInput
                style={styles.field}
                placeholder="What you're planning to make (e.g. plum jam)"
                placeholderTextColor={C.inkSoft}
                value={plan}
                onChangeText={setPlan}
                accessibilityLabel="What you're planning to make"
              />
              <TextInput
                style={[styles.field, styles.fieldMulti]}
                placeholder="Notes (ripeness, how to reach it, taste…)"
                placeholderTextColor={C.inkSoft}
                value={note}
                onChangeText={setNote}
                multiline
                accessibilityLabel="Notes about the find"
              />
              <TextInput
                style={styles.field}
                placeholder="Your name (optional)"
                placeholderTextColor={C.inkSoft}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                accessibilityLabel="Your name"
              />

              {isNewTree && (
                <Pressable
                  style={styles.checkRow}
                  onPress={() => setContributeFF((v) => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: contributeFF }}
                >
                  <View style={[styles.checkbox, contributeFF && styles.checkboxOn]}>
                    {contributeFF && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <Text style={styles.checkLabel}>
                    Also share this tree with Falling Fruit, the open map this is built on.
                  </Text>
                </Pressable>
              )}

              {!!err && <Text style={styles.geoError}>{err}</Text>}

              <Pressable
                style={({ pressed }) => [
                  styles.walkBtn,
                  pressed && styles.ctaPressed,
                  busy && { opacity: 0.7 },
                ]}
                onPress={send}
                disabled={busy}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <Text style={styles.ctaText}>Post it</Text>
                )}
              </Pressable>
              <Text style={styles.safety}>
                Posts are anonymous unless you add a name, and get a quick review before they appear.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
        <Image
          source={{ uri: find.images[0] }}
          style={styles.thumb}
          resizeMode="cover"
          accessibilityLabel={find.type}
        />
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
            {find.atPeak ? "PEAK" : find.inSeason ? "IN SEASON" : seasonRange(find)}
          </Text>
        </View>
        <Text style={styles.chev}>›</Text>
      </View>
    </Pressable>
  );
}

/* -------------------------------- Detail ------------------------------- */

function Detail({
  find,
  mapSource,
  referralParams,
  onClose,
  onWalk,
}: {
  find: Find | null;
  mapSource: string | null;
  referralParams: ReferralParams;
  onClose: () => void;
  onWalk: (f: Find) => void;
}) {
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
  const open = () => {
    track(
      "walk_here_clicked",
      withMapSource(mapSource, {
        species: find.type,
        ff_location_id: find.id.split("-")[0],
      }, referralParams)
    );
    Linking.openURL(directionsUrl(find.lat, find.lng, find.type));
    onWalk(find); // after sending them walking, invite them to share how it goes
  };

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
                <Image
                  key={uri}
                  source={{ uri }}
                  style={[styles.heroImg, { width: heroW }]}
                  resizeMode="cover"
                  accessibilityLabel={find.type}
                />
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
                {find.atPeak ? "AT PEAK NOW" : find.inSeason ? "IN SEASON" : seasonRange(find)}
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

          <Text style={styles.detailName}>Where the data comes from</Text>

          <Text style={[styles.aboutPara, { marginTop: 18 }]}>
            Forage Around is a map of reported fruit trees and edible plants near you. None
            of the underlying data is ours, so here is exactly where each piece comes from.
          </Text>

          <Text style={styles.aboutPara}>
            The map of trees comes from <Link label="Falling Fruit" url="https://fallingfruit.org" />,
            a nonprofit, volunteer-run map of the urban harvest. Their locations are used here under
            the <Link label="CC BY-NC-SA license" url="https://creativecommons.org/licenses/by-nc-sa/4.0/" />.
            The season windows, the ways to use each plant, and the preservation ideas are added on
            top; the locations are theirs and are crowd-sourced, so treat them as a starting point,
            not gospel.
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
          <Text style={styles.aboutPara}>
            Questions or corrections? Email{" "}
            <Link label={SUPPORT_EMAIL} url={`mailto:${SUPPORT_EMAIL}`} />.
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
  addrGoPressed: { backgroundColor: "#8D3F10" },
  addrGoText: { color: C.white, fontSize: 16, fontWeight: "700", fontFamily: F.display },
  geoError: { color: C.berry, fontSize: 13, marginTop: 10, lineHeight: 19 },

  seasonCard: { backgroundColor: C.white, borderRadius: 20, padding: 22, borderWidth: 1, borderColor: C.line },
  seasonLabel: { fontSize: 12, letterSpacing: 1.5, color: C.ripe, fontWeight: "700", marginBottom: 8 },
  seasonList: { fontFamily: F.display, fontSize: 24, lineHeight: 32, color: C.ink, textTransform: "capitalize", marginBottom: 12 },
  ripeStrip: { marginTop: 14, marginBottom: 14 },
  ripeTile: { width: 84, alignItems: "center" },
  ripeImg: { width: 84, height: 84, borderRadius: 14, backgroundColor: C.paperDeep },
  ripeEmoji: { alignItems: "center", justifyContent: "center" },
  ripeName: { fontSize: 12, color: C.ink, marginTop: 6, textAlign: "center", width: 84 },
  seasonNote: { fontSize: 14, lineHeight: 21, color: C.inkSoft },
  footLink: { marginTop: 28, alignSelf: "center" },
  footnote: { fontSize: 13, color: C.forest, textAlign: "center", fontWeight: "600" },
  footCredit: { marginTop: 8, fontSize: 11.5, color: C.inkSoft, textAlign: "center" },
  aboutByline: { fontSize: 14, color: C.inkSoft, marginTop: 4, fontStyle: "italic" },
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

  /* Community photo wall */
  wall: { marginTop: 26, paddingTop: 22, borderTopWidth: 1, borderTopColor: C.line },
  wallTitle: { fontFamily: F.display, fontSize: 22, color: C.ink, marginBottom: 14 },
  wallTile: { width: 132 },
  wallImg: { width: 132, height: 132, borderRadius: 14, backgroundColor: C.paperDeep },
  wallImgEmpty: { alignItems: "center", justifyContent: "center" },
  wallCaption: { fontSize: 12, lineHeight: 16, color: C.inkSoft, marginTop: 6 },
  wallEmpty: { fontSize: 14, lineHeight: 21, color: C.inkSoft },
  wallActions: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 },
  wallBtn: { backgroundColor: C.forest, paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12 },
  wallBtnText: { color: C.white, fontWeight: "700", fontSize: 15, fontFamily: F.display },
  wallSeeAll: { color: C.forest, fontWeight: "700", fontSize: 15 },

  /* Submit form */
  photoPick: {
    height: 180,
    borderRadius: 16,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 20,
    marginBottom: 14,
  },
  photoPreview: { width: "100%", height: "100%" },
  photoPickText: { color: C.inkSoft, fontSize: 16 },
  field: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: C.ink,
    marginBottom: 12,
  },
  fieldMulti: { minHeight: 84, textAlignVertical: "top" },
  checkRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 2, marginBottom: 6 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: C.forest, borderColor: C.forest },
  checkboxTick: { color: C.white, fontSize: 14, fontWeight: "800" },
  checkLabel: { flex: 1, fontSize: 14, lineHeight: 20, color: C.inkSoft },

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
