from typing import Dict
import tempfile
import os

# Optional: Integrate PaddleOCR when available in environment
try:
    from paddleocr import PaddleOCR  # type: ignore
    _ocr = PaddleOCR(use_angle_cls=True, lang='en')
except Exception:
    _ocr = None


def run_ocr(image_bytes: bytes) -> Dict:
    if _ocr is None:
        return {"text": "Stub OCR text", "confidence": 0.5, "engine": "stub"}
    # Write bytes to a temp file for OCR
    tmp_file = None
    try:
        fd, tmp_file = tempfile.mkstemp(suffix=".png")
        with os.fdopen(fd, 'wb') as f:
            f.write(image_bytes)
        result = _ocr.ocr(tmp_file, cls=True)
        # Flatten text
        lines = []
        confs = []
        for page in result or []:
            for line in page or []:
                txt = line[1][0]
                conf = float(line[1][1]) if line and line[1] and line[1][1] is not None else 0.0
                lines.append(txt)
                confs.append(conf)
        text = "\n".join(lines)
        avg_conf = sum(confs)/len(confs) if confs else 0.0
        return {"text": text, "confidence": avg_conf, "engine": "paddleocr"}
    except Exception:
        return {"text": "OCR failed", "confidence": 0.0, "engine": "paddleocr"}
    finally:
        if tmp_file and os.path.exists(tmp_file):
            try:
                os.remove(tmp_file)
            except Exception:
                pass