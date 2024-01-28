import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import queue
import threading
import time
import subprocess
from pydantic import BaseModel
from starlette.responses import FileResponse
import os
import json
from PIL import Image
import re
import uuid
import logging


def run_server():
  uvicorn.run(app, port=8080, host="0.0.0.0")


logging.basicConfig(filename='app.log', level=logging.INFO)


def clear_file(folder_path):
  for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)
    try:
      if os.path.isfile(file_path) or os.path.islink(file_path):
        os.unlink(file_path)
    except Exception as e:
      pass


def keep_file(folder_path):
  _ = []
  for filename in os.listdir(folder_path):
    _.append(folder_path + "/" + filename)
  return _


def remove_file(list_filename: list):
  for i in list_filename:
    os.remove(i)


my_queue = queue.Queue()

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=['*'],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

global status_err
status_err = False


class DataText(BaseModel):
  prompt: Optional[str]
  status_error: Optional[bool]


class BackgroundTasks(threading.Thread):

  def run(self, *args, **kwargs):
    global status_err
    my_queue.put(self.ip)
    print("start generate image...")
    old_file_thumbnail = keep_file("thumbnail")
    old_file_output = keep_file("output")
    command = [
      'python3', '-m', 'ImageGen', '--cookie-file', 'cookies.json', '--prompt',
      self.prompt
    ]
    # Execute the command and capture the output
    try:
      output = subprocess.check_output(command, stderr=subprocess.STDOUT)
      remove_file(old_file_output)
      print("generate finish")
      for i in os.listdir("output"):
        os.rename("output/" + i, f"output/{uuid.uuid4()}.jpeg")
      print(os.getcwd())

      _ = []
      for i in os.listdir("output"):
        try:
          with Image.open(f"output/{i}") as im:
            width, height = 300, 300
            im = im.resize((width, height))
            quality = 90
            im.save("thumbnail/" + re.match(r'(.*)\..*', f"{i}").group(1) +
                    '.webp',
                    'webp',
                    quality=quality)
        except:
          pass
      print("thumbnail finish")
      remove_file(old_file_thumbnail)
      my_queue.get()
      with open("promp.json", "w") as outfile:
        json.dump({"text": self.prompt}, outfile)
      return output.decode()
    except subprocess.CalledProcessError as e:
      status_err = True
      my_queue.get()
      return e.output.decode()


@app.get("/")
async def read_root(request: Request):
  client_host = request.client.host
  return {"client_host": client_host}


@app.post("/generate-image")
async def generate_image(data: DataText, request: Request):
  if len(list(my_queue.queue)) < 1 and data.prompt != "":
    t = BackgroundTasks()
    t.ip = request.client.host
    t.prompt = data.prompt
    logging.info(f"{t.ip} ---- {t.prompt}")
    t.start()

  elif len(list(my_queue.queue)) == 1:
    return "has queue processing"


@app.get("/image")
async def list_images():

  if len(list(my_queue.queue)) < 1:
    image_files = [
      "https://99d6b332-c3c0-4af8-a69b-2d9e22b0605f-00-1q2p73pdnjzlr.worf.replit.dev/image/" + i
      for i in os.listdir("output")
    ]
    image_thumbnail = [
      "https://99d6b332-c3c0-4af8-a69b-2d9e22b0605f-00-1q2p73pdnjzlr.worf.replit.dev/thumbnail/" + i
      for i in os.listdir("thumbnail")
    ]
    with open("promp.json", "r") as infile:
      data = json.load(infile)
    return {
      "status_gen": True,
      "images": image_files,
      "thumbnail": image_thumbnail,
      "prompt_text": data["text"],
      "status_erro": status_err
    }
  else:
    return {"status_gen": False, "images": None, "prompt_text": ""}


@app.get("/image/{filename}")
async def get_image(filename: str):
  filepath = f"output/{filename}"
  return FileResponse(filepath)


@app.get("/thumbnail/{filename}")
async def get_thumbnail(filename: str):
  filepath = f"thumbnail/{filename}"
  return FileResponse(filepath)


@app.post("/status-error")
async def status_error(data: DataText):
  global status_err
  status_err = False
  return "Change status_err to false finish"


run_server()
