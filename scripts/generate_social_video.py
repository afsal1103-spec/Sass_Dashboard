import math
from pathlib import Path

import cv2
import numpy as np

WIDTH = 1080
HEIGHT = 1920
FPS = 24
DURATION = 14
TOTAL_FRAMES = FPS * DURATION

OUTPUT_VIDEO = Path("public/media/sass-dashboard-social.mp4")
OUTPUT_THUMBNAIL = Path("public/media/sass-dashboard-social-cover.png")


def blend(frame: np.ndarray, overlay: np.ndarray, alpha: float) -> np.ndarray:
    return cv2.addWeighted(overlay, alpha, frame, 1 - alpha, 0)


def draw_text_center(frame: np.ndarray, text: str, y: int, scale: float, color, thickness: int = 2):
    font = cv2.FONT_HERSHEY_DUPLEX
    (w, h), _ = cv2.getTextSize(text, font, scale, thickness)
    x = (WIDTH - w) // 2
    cv2.putText(frame, text, (x, y + h), font, scale, color, thickness, cv2.LINE_AA)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def ease_out_cubic(t: float) -> float:
    return 1 - (1 - t) ** 3


# Precompute vertical gradient background
bg_top = np.array([8, 18, 37], dtype=np.float32)    # BGR
bg_bottom = np.array([20, 62, 99], dtype=np.float32)
y = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None]
grad_line = ((1 - y) * bg_top + y * bg_bottom).astype(np.uint8)
base_background = np.repeat(grad_line[:, None, :], WIDTH, axis=1)

writer = cv2.VideoWriter(
    str(OUTPUT_VIDEO),
    cv2.VideoWriter_fourcc(*"mp4v"),
    FPS,
    (WIDTH, HEIGHT),
)

if not writer.isOpened():
    raise RuntimeError("Could not open video writer. mp4v codec may be unavailable.")

features = [
    "Client CRM + follow-up tracking",
    "Project pipeline with clear deadlines",
    "Invoices with payment visibility",
    "AI proposals in seconds",
]

for frame_idx in range(TOTAL_FRAMES):
    t = frame_idx / FPS
    frame = base_background.copy()

    # Animated soft circles
    overlay = frame.copy()
    c1_x = int(lerp(120, WIDTH - 200, 0.5 + 0.5 * math.sin(t * 0.8)))
    c1_y = int(lerp(180, HEIGHT * 0.42, 0.5 + 0.5 * math.cos(t * 0.6)))
    c2_x = int(lerp(WIDTH - 120, 220, 0.5 + 0.5 * math.sin(t * 0.55 + 1.2)))
    c2_y = int(lerp(HEIGHT - 300, HEIGHT * 0.55, 0.5 + 0.5 * math.cos(t * 0.75 + 0.8)))
    cv2.circle(overlay, (c1_x, c1_y), 260, (80, 220, 255), -1)
    cv2.circle(overlay, (c2_x, c2_y), 220, (85, 160, 255), -1)
    frame = blend(frame, overlay, 0.13)

    # subtle grid
    for x in range(0, WIDTH, 90):
        cv2.line(frame, (x, 0), (x, HEIGHT), (80, 140, 190), 1)
    for y_line in range(0, HEIGHT, 90):
        cv2.line(frame, (0, y_line), (WIDTH, y_line), (80, 140, 190), 1)

    if t < 4.5:
        intro_t = min(1.0, t / 1.2)
        intro_alpha = ease_out_cubic(intro_t)

        title_y = int(lerp(860, 760, intro_alpha))
        sub_y = int(lerp(980, 900, intro_alpha))

        draw_text_center(frame, "SASS DASHBOARD", title_y, 1.8, (240, 248, 255), 4)
        draw_text_center(frame, "Freelancer Operating System", sub_y, 1.0, (185, 225, 255), 2)
        draw_text_center(frame, "Clients | Projects | Invoices | AI Proposals", sub_y + 84, 0.75, (200, 235, 255), 1)

        cv2.rectangle(frame, (220, 1100), (860, 1180), (15, 42, 73), -1)
        cv2.rectangle(frame, (220, 1100), (860, 1180), (140, 210, 255), 2)
        draw_text_center(frame, "Built for creators who ship fast", 1128, 0.82, (255, 225, 150), 2)

    elif t < 10.5:
        scene_t = t - 4.5
        draw_text_center(frame, "One workspace for your freelance flow", 250, 0.95, (230, 245, 255), 2)

        # Simulated app panel
        panel_x, panel_y = 90, 360
        panel_w, panel_h = WIDTH - 180, 1180
        cv2.rectangle(frame, (panel_x, panel_y), (panel_x + panel_w, panel_y + panel_h), (10, 35, 60), -1)
        cv2.rectangle(frame, (panel_x, panel_y), (panel_x + panel_w, panel_y + panel_h), (145, 210, 255), 2)

        # top chips
        chip_labels = ["Revenue", "Projects", "Clients", "Proposals"]
        for i, label in enumerate(chip_labels):
            cx = panel_x + 40 + i * 220
            cy = panel_y + 45
            cv2.rectangle(frame, (cx, cy), (cx + 180, cy + 56), (19, 52, 84), -1)
            cv2.rectangle(frame, (cx, cy), (cx + 180, cy + 56), (120, 185, 232), 1)
            cv2.putText(frame, label, (cx + 16, cy + 37), cv2.FONT_HERSHEY_SIMPLEX, 0.62, (220, 242, 255), 1, cv2.LINE_AA)

        # feature cards animation
        active = int(scene_t / 1.45) % len(features)
        local_t = (scene_t % 1.45) / 1.45
        slide = int(lerp(40, 0, ease_out_cubic(min(1.0, local_t))))

        for i, feature in enumerate(features):
            card_y = panel_y + 190 + i * 205
            card_x = panel_x + 60
            card_w = panel_w - 120
            card_h = 160
            highlight = i == active

            offset = -slide if highlight else 0
            cv2.rectangle(frame, (card_x + offset, card_y), (card_x + card_w + offset, card_y + card_h), (13, 47, 78), -1)
            border_color = (126, 212, 255) if highlight else (90, 150, 200)
            cv2.rectangle(frame, (card_x + offset, card_y), (card_x + card_w + offset, card_y + card_h), border_color, 2)
            cv2.circle(frame, (card_x + 34 + offset, card_y + 34), 10, (255, 210, 120), -1)
            cv2.putText(
                frame,
                feature,
                (card_x + 60 + offset, card_y + 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.78,
                (230, 245, 255),
                2 if highlight else 1,
                cv2.LINE_AA,
            )
            cv2.putText(
                frame,
                "Designed to reduce admin and increase delivery speed",
                (card_x + 60 + offset, card_y + 92),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.56,
                (168, 213, 245),
                1,
                cv2.LINE_AA,
            )

    else:
        outro_t = min(1.0, (t - 10.5) / 2.5)
        scale_up = ease_out_cubic(outro_t)

        cta_y = int(lerp(760, 700, scale_up))
        draw_text_center(frame, "Make freelance work simpler", cta_y, 1.15, (240, 248, 255), 3)
        draw_text_center(frame, "and more profitable.", cta_y + 84, 1.15, (240, 248, 255), 3)

        btn_w = int(650 + 80 * scale_up)
        btn_h = int(110 + 10 * scale_up)
        x1 = (WIDTH - btn_w) // 2
        y1 = 980
        cv2.rectangle(frame, (x1, y1), (x1 + btn_w, y1 + btn_h), (26, 60, 95), -1)
        cv2.rectangle(frame, (x1, y1), (x1 + btn_w, y1 + btn_h), (255, 212, 122), 3)
        draw_text_center(frame, "Start with Sass Dashboard", y1 + 30, 1.0, (255, 234, 176), 2)

        draw_text_center(frame, "Try it now", 1300, 0.88, (190, 226, 255), 2)
        draw_text_center(frame, "#FreelanceBusiness #SaaS #Productivity", 1510, 0.66, (175, 213, 244), 1)

    if frame_idx == 0:
        cv2.imwrite(str(OUTPUT_THUMBNAIL), frame)

    writer.write(frame)

writer.release()
print(f"Video saved to {OUTPUT_VIDEO}")
print(f"Thumbnail saved to {OUTPUT_THUMBNAIL}")
