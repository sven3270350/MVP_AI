import styles from "../styles/ai.module.css";
import { Stack } from "@chakra-ui/react";
import ReactAudioPlayer from "react-audio-player";
import React, { useEffect, useState, useCallback } from "react";
import logo from "../logo/logo7.png";

export type Category = {
  id: string;
  data: string;
  keyword: string;
  parentId: number;
};

export type Audio = {
  id: string;
  url: string;
  category: string;
};

export type Language = {
  lang: string;
  hidden_text: string;
};

export type SubCategory = {
  data: string;
  hidden_text: string;
  id: string;
  parentId: string;
};

export type Template = {
  category: string;
  data: string;
  id: string;
};

export type Video = {
  category: string;
  id: string;
  url: string;
};

const apiKey = "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";

const apiUrl = process.env.NEXT_PUBLIC_OPEN_AI_URL
  ? process.env.NEXT_PUBLIC_OPEN_AI_URL
  : "https://api.openai.com/v1/completions";

const apiDataUrl =
  "https://futuria-git-main-futurixlab.vercel.app/api/categories";

const AiPage = () => {
  const [categories, setCategories] = useState<Category[]>();
  const [subCategories, setSubCategories] = useState<SubCategory[]>();
  const [musics, setMusics] = useState<Audio[]>();
  const [videos, setVideos] = useState<Video[]>();
  const [templates, setTemplates] = useState<Template[]>();
  const [languages, setLanguages] = useState<Language[]>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("none");
  const [keyword, setKeyword] = useState<string[]>([""]);
  const [template, setTemplate] = useState<string[]>([""]);
  const [subCategory, setSubCategory] = useState<string>("0");
  const [language, setLanguage] = useState<string>("in English");
  const [question, setQuestion] = useState<string>("");
  const [userQuestion, setUserQuestion] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [audios, setAudios] = useState<Audio[]>();
  const [curAudio, setCurAudio] = useState<string>("");

  useEffect(() => {
    try {
      fetch("https://service.bnpb.go.id/api/proxy/" + apiDataUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.status === "success") {
            setCategories(data.category);
            setSubCategories(data.subCategory);
            setMusics(data.audio);
            setVideos(data.video);
            setTemplates(data.template);
            setLanguages(data.languages);
          } else {
            alert("Something went wrong.");
          }
        });
    } catch (error) {
      alert("Something went wrong." + error);
    }
  }, []);

  useEffect(() => {
    if (category !== "none") {
      const cur_category = categories?.filter((value) => value.id === category);
      console.log("~~~~~~~~~~~~~~~~~~", cur_category, category);
      const keywords =
        cur_category !== undefined
          ? cur_category[0].keyword
              .split(",")
              .map((value) => value.replace(/(\r\n|\n|\r)/gm, "").trim())
          : [""];
      setKeyword(keywords);
      const video = videos?.filter((value) => value.category === category);
      setVideoUrl(video ? video[0].url + "&autoplay=1" : "");
      const audios = musics?.filter((value) => value.category === category);
      setAudios(audios);
      const cur_template = templates?.filter(
        (value) => value.category === category
      );
      setTemplate(
        cur_template ? cur_template.map((value) => value.data) : [""]
      );
      setSubCategory("0");
      setCurAudio("0");
    }
  }, [category]);

  useEffect(() => {
    if (subCategory !== "0") {
      const video = videos?.filter((value) => value.category === subCategory);
      setVideoUrl(video ? video[0].url + "&autoplay=1" : "");
      const audios = musics?.filter((value) => value.category === subCategory);
      setAudios(audios);
      setCurAudio("0");
    }
  }, [subCategory]);

  useEffect(() => {
    const cur_subCategory = subCategories?.filter(
      (value) => value.id === subCategory
    );
    console.log(cur_subCategory);
    setQuestion(
      cur_subCategory?.length !== 0 && cur_subCategory
        ? cur_subCategory[0].hidden_text + ". " + userQuestion + "." + language
        : ""
    );
  }, [language, userQuestion, subCategory]);

  const handleRunClick = useCallback(async () => {
    if (userQuestion === "") {
      alert("Please fill the question field");
      return;
    }

    // if (category === "none") {
    //   alert("Please select the category");
    //   return;
    // }

    // if (subCategory === "" || subCategory === "0") {
    //   alert("Please select the subCategory");
    //   return;
    // }

    try {
      const hasKeyword = keyword.some((keyword) =>
        userQuestion.includes(keyword)
      );

      if (true) {
        setIsLoading(true);
        console.log(question);
        const data = {
          prompt: question,
          max_tokens: 2000,
          model: "text-davinci-003",
          temperature: 0.5,
        };

        fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + apiKey,
          },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log(data.choices[0].text);
            setIsLoading(false);
            setResult(data.choices[0].text);
          })
          .catch((error) => {
            setIsLoading(false);
            console.error(error);
          });
      } else {
        alert(
          "Please set the correct query. These query isn't related with given category."
        );
      }
    } catch (err) {
      setIsLoading(false);
      alert("Something went wrong.\n" + err);
    }
  }, [question, userQuestion, category]);

  const handleCopyClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result);
      alert("Result Copied");
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }, [result]);

  return isLoading ? (
    <div className="fixed top-0 left-0 right-0 bottom-0 w-full h-screen z-50 overflow-hidden bg-gray-700 opacity-75 flex flex-col items-center justify-center">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
      <h2 className="text-center text-white text-xl font-semibold">
        Loading...
      </h2>
      <p className="w-1/3 text-center text-white">
        This may take a few seconds, please don't close this page.
      </p>
    </div>
  ) : (
    <>
      <div className="text-center bg-gray-100">
        <h1>Your Header goese here</h1>
      </div>
      <div className="container mx-auto flex flex-col p-4">
        <div className={`p-2 ${styles.video_container}`}>
          <iframe
            className={styles.video}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            src={
              category === "none" || videoUrl === ""
                ? "https://firebasestorage.googleapis.com/v0/b/mlm-admin-ca994.appspot.com/o/category%2FtsSx3VlmGs.mp4?alt=media&token=0abe6f3c-bb91-4108-a439-36978fc172dc&autoplay=1"
                : videoUrl
            }
            allowFullScreen
          ></iframe>
        </div>
        <div className="grid grid-cols-3 p-2">
          <div className="col-span-3 sm:col-span-2 flex flex-col mr-2">
            <div className="mb-2 flex justify-between">
              <div>
                <img src={logo.src} alt="logo" className={styles.logo_image} />
              </div>
              <div>
                <select
                  id="languages"
                  className="ai_select"
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="in English">Choose a Language</option>
                  {languages?.map((value, index) => (
                    <option key={index} value={value.hidden_text}>
                      {value.lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <select
                  id="categories"
                  className="ai_select mb-1"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="none">Choose a Category</option>
                  {categories?.map((value, index) => (
                    <option key={index} value={value.id}>
                      {value.data.toUpperCase()}
                    </option>
                  ))}
                </select>
                <select
                  id="subCategories"
                  className="ai_select mb-1"
                  value={subCategory}
                  disabled={category === "none" ? true : undefined}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  <option value="0">Choose a SubCategory</option>
                  {subCategories
                    ?.filter((value) => value.parentId === category)
                    .map((value, index) => (
                      <option key={index} value={value.id}>
                        {value.data.toUpperCase()}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="h-full">
              <textarea
                name="questions"
                id="questions"
                className={`${styles.question_field} input h-full`}
                onChange={(e) => setUserQuestion(e.target.value)}
                value={userQuestion}
              />
              <button
                type="button"
                className={`${styles.run_button} ai_button`}
                onClick={handleRunClick}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Icon description</span>
              </button>
            </div>
          </div>
          <div className={`${styles.size} col-span-3 sm:col-span-1 mt-1`}>
            <div className="flex items-center flex-col pb-2 px-4">
              <div className="w-full">
                <ReactAudioPlayer
                  src={curAudio}
                  controls
                  className="pb-1 w-full"
                />
              </div>
              <select
                id="audioSelector"
                className="ai_select"
                value={curAudio}
                onChange={(e) => setCurAudio(e.target.value)}
              >
                <option value="0">Choose a Audio</option>
                {audios?.map((value, index) => (
                  <option key={index} value={value.url}>
                    {`Audio ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Stack direction="column">
                {template?.map((value, index) => (
                  <span
                    key={index}
                    className="text-md py-1 px-2.5 font-bold bg-green-500 text-white rounded hover:cursor-pointer"
                    onClick={() => setUserQuestion(value)}
                  >
                    {value}
                  </span>
                ))}
              </Stack>
            </div>
          </div>
        </div>
        <div
          className={`p-5 shadow-md bg-slate-100 ${styles.result_container}`}
        >
          {result.split("\n").map((item: string, index: number) => (
            <React.Fragment key={index}>
              {item}
              <br />
            </React.Fragment>
          ))}
          <div className={`flex justify-end ${styles.button_container}`}>
            <button
              type="button"
              className={`${styles.run_button} ai_button`}
              onClick={handleCopyClick}
            >
              Copy
            </button>
            <button
              type="button"
              className={`${styles.run_button} ai_button`}
              onClick={() => setResult("")}
            >
              Delete
            </button>
            <button
              type="button"
              className={`${styles.run_button} ai_button`}
              onClick={handleRunClick}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AiPage;
