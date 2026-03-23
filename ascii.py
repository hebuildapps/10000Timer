"""
convert.py — ASCII Frame Generator for 10000Timer
Converts MP4 videos into ASCII art .txt frames.

Usage:
    python convert.py fire.mp4 --theme fire
    python convert.py rain.mp4 --theme rain
    python convert.py ocean.mp4 --theme ocean

Install deps first:
    pip install opencv-python Pillow
"""

import cv2
import os
import argparse
from PIL import Image
import numpy as np

# ── Configuration (mirrors ascii.sh settings) ──────────────────────────────
ASCII_CHARS = " .'`^,:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
OUTPUT_COLS = 100          # characters per row (width)
FONT_RATIO  = 0.44         # char width/height ratio correction
OUTPUT_FPS  = 24           # frames per second to extract
MAX_FRAMES  = 300          # hard cap
LUM_THRESHOLD = 15         # pixels darker than this become spaces (background removal)

def frame_to_ascii(frame_bgr: np.ndarray, cols: int, font_ratio: float, threshold: int) -> str:
    """Convert a single BGR video frame to an ASCII string."""
    # Convert to RGB then grayscale
    frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
    img = Image.fromarray(frame_rgb)

    orig_w, orig_h = img.size
    # Calculate rows to maintain aspect ratio with font correction
    char_w = orig_w / cols
    char_h = char_w / font_ratio
    rows = int(orig_h / char_h)

    # Resize to target cols x rows
    img_resized = img.resize((cols, rows), Image.LANCZOS)
    img_gray = img_resized.convert("L")  # grayscale

    pixels = np.array(img_gray)
    ascii_lines = []

    for row in pixels:
        line = ""
        for lum in row:
            if lum < threshold:
                line += " "  # strip dark background
            else:
                # Map luminance 0-255 → index in ASCII_CHARS
                index = int((lum / 255) * (len(ASCII_CHARS) - 1))
                line += ASCII_CHARS[index]
        ascii_lines.append(line)

    return "\n".join(ascii_lines)


def convert_video(video_path: str, theme: str):
    if not os.path.exists(video_path):
        print(f"[ERROR] File not found: {video_path}")
        return

    # Output directory
    out_dir = os.path.join("assets", "frames", theme)
    os.makedirs(out_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"[ERROR] Could not open video: {video_path}")
        return

    source_fps = cap.get(cv2.CAP_PROP_FPS)
    total_source_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = max(1, round(source_fps / OUTPUT_FPS))  # step to hit target fps

    print(f"[INFO] Video: {video_path}")
    print(f"[INFO] Source FPS: {source_fps:.1f} | Total frames: {total_source_frames}")
    print(f"[INFO] Extracting every {frame_interval} frame(s) → ~{OUTPUT_FPS}fps output")
    print(f"[INFO] Output dir: {out_dir}")
    print(f"[INFO] Max frames: {MAX_FRAMES}")
    print()

    frame_idx = 0       # source frame counter
    saved_idx = 0       # output frame counter

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % frame_interval == 0:
            ascii_art = frame_to_ascii(frame, OUTPUT_COLS, FONT_RATIO, LUM_THRESHOLD)

            filename = f"frame_{str(saved_idx + 1).zfill(4)}.txt"
            filepath = os.path.join(out_dir, filename)

            with open(filepath, "w", encoding="utf-8") as f:
                f.write(ascii_art)

            saved_idx += 1
            print(f"\r[INFO] Saved {saved_idx}/{MAX_FRAMES} frames...", end="", flush=True)

            if saved_idx >= MAX_FRAMES:
                break

        frame_idx += 1

    cap.release()
    print(f"\n[DONE] {saved_idx} frames saved to: {out_dir}")
    print(f"[DONE] Files: frame_0001.txt → frame_{str(saved_idx).zfill(4)}.txt")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert MP4 to ASCII frames for 10000Timer")
    parser.add_argument("video", help="Path to input MP4 file")
    parser.add_argument("--theme", required=True, choices=["fire", "rain", "ocean", "forest", "custom"],
                        help="Theme name (determines output folder)")
    parser.add_argument("--cols", type=int, default=OUTPUT_COLS,
                        help=f"Output columns/width (default: {OUTPUT_COLS})")
    parser.add_argument("--fps", type=int, default=OUTPUT_FPS,
                        help=f"Output FPS (default: {OUTPUT_FPS})")
    parser.add_argument("--max-frames", type=int, default=MAX_FRAMES,
                        help=f"Max frames to extract (default: {MAX_FRAMES})")
    parser.add_argument("--threshold", type=int, default=LUM_THRESHOLD,
                        help=f"Luminance threshold for background removal (default: {LUM_THRESHOLD})")

    args = parser.parse_args()

    # Override globals with CLI args
    OUTPUT_COLS   = args.cols
    OUTPUT_FPS    = args.fps
    MAX_FRAMES    = args.max_frames
    LUM_THRESHOLD = args.threshold

    convert_video(args.video, args.theme)

