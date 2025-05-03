(ns guitar)

(def STRINGS ["E" "A" "D" "G" "B" "e"])
(def NOTE_ORDER ["A" "A#" "B" "C" "C#" "D" "D#" "E" "F" "F#" "G" "G#"])

(defn generate-notes [numberOfFrets]
  (let [notes (atom [])]
    (doseq [string STRINGS]
      (doseq [fret (range 0 (+ 1 numberOfFrets))]
        (let [startingNote (.indexOf NOTE_ORDER (clojure.string/upper-case string))
              note (get NOTE_ORDER (mod (+ startingNote fret) (count NOTE_ORDER)))]
          (swap! notes conj {:note note :fret fret :string string :color nil}))))
    @notes))

(def notes (generate-notes 16)) ;; 16 frets, should get this from the frontend...

; Get the key for a given note
(defn get-key [note]
  (let [key (atom [])
        root (.indexOf NOTE_ORDER (clojure.string/upper-case note))
        intervals [0 2 4 5 7 9 11]]
    (doseq [i (range (count intervals))]
      (let [index (mod (+ root (nth intervals i)) (count NOTE_ORDER))]
        (swap! key conj (nth NOTE_ORDER index))))
    @key))

; Write a predicate that returns true if a note is in the given key
(defn is-in-key [note]
  (fn [item] (some #(= % (:note item)) (get-key note))))

; Write a predicate to be used in a filter to get notes that match a given note 
(defn is-note [note]
  (fn [item] (= (:note item) note)))

; Write a predicate to filter notes that are on a given set of frets
(defn is-between-frets [start end]
  (fn [item] (and (>= (:fret item) start) (<= (:fret item) end))))

; Write a predicate to filter notes that are on a given set of strings
(defn is-on-strings [strings]
  (fn [item] (some #(= % (:string item)) strings)))

; Write a function that colors specific notes
(defn color-notes [notes color]
  (fn [item] (if (some #(= % (:note item)) notes)
          (assoc item :color color)
          item)))

;; Fire an event that we're loaded
(js/document.dispatchEvent (js/Event. "guitar-clj-loaded"))