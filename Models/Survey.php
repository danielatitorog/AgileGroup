<?php
/**
 * Survey class
 * This class handles loading and managing survey questions from JSON files.
 * It supports age-specific surveys and provides fallback default questions.
 * If JSON files are missing or invalid.
 */
class Survey
{
    // Protected properties for internal class use
    protected $questions;
    protected $surveyData;
    protected $error;
    protected $ageGroup;

    /**
     * Constructor - Initializes the survey object
     * @param $ageGroup
     * Initialize properties with default values
     */
    public function __construct($ageGroup = null)
    {
        $this->questions = [];
        $this->surveyData = [];
        $this->error = '';
        $this->ageGroup = $ageGroup;

        // Get the appropriate JSON file path based on age group
        $jsonFile = $this->getJsonFilePath();

        // Check if the JSON file exists
        if (!file_exists($jsonFile)) {
            // If file not found then set error and create default questions
            $this->error = "Survey data file not found.";
            $this->createDefaultQuestions();
            return;
        }

        // Attempt to read the JSON file content
        $jsonContent = file_get_contents($jsonFile);
        if ($jsonContent === false) {
            // If file read failed then set error and create default questions
            $this->error = "Unable to read survey data file.";
            $this->createDefaultQuestions();
            return;
        }
        // Decode JSON content into PHP array
        $this->surveyData = json_decode($jsonContent, true);
        // check for JSON decoding errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            // If JSON format is invalid then set error and create default questions
            $this->error = "Invalid JSON format in survey data file.";
            $this->createDefaultQuestions();
            return;
        }
        // Extract questions from survey data if available
        if (isset($this->surveyData['questions']) && is_array($this->surveyData['questions'])) {
            $this->questions = $this->surveyData['questions'];
        } else {
            $this->questions = [];
        }
        // if questions array is empty then use defaults
        if (empty($this->questions)) {
            $this->error = "No questions found in survey data.";
            $this->createDefaultQuestions();
        }
    }

    /**
     * Determine the JSON file path based on age group
     * This method returns the filename for the appropriate survey JSON file.
     * It implements age-specific survey loading.
     * @return string Filename for the survey JSON file
     */
    private function getJsonFilePath()
    {
        // check age group and return corresponding filename
        if ($this->ageGroup === "12-15") {
            return"survey_questions_12-15.json";
        }
        elseif ($this->ageGroup === "15-18") {
            return "survey_questions_15-18.json";
        } else {
            return "survey_questions.json";
        }

    }
    /**
     * Create default questions if JSON file is missing or invalid
     * This method is called when
     * JSON file doesn't exist
     * JSON file can't be read
     * JSON contains invalid format
     * No questions found in JSON
     * It ensures the survey always has basic questions available.
     */
    private function createDefaultQuestions()
    {
        $this->surveyData = [
            'title' => 'Investment Knowledge Survey',
            'description' => 'Assess your current experience and knowledge about investing'
        ];

        $this->questions = [
            [
                'id' => 1,
                'question' => 'How familiar are you with investing?',
                'type' => 'radio',
                'options' => ['Beginner', 'Some knowledge', 'Experienced']
            ],
            [
                'id' => 2,
                'question' => 'Have you ever invested money before?',
                'type' => 'radio',
                'options' => ['Yes', 'No']
            ]
        ];
    }

    /**
     * Get all survey questions
     * Returns the complete array of questions data including:
     * id, question text, type, and options
     * @return array All survey questions
     */
    public function getAllQuestions()
    {
        return $this->questions;
    }

    /**
     * Get a specific questions by its ID
     * searches through questions array to find a question with matching ID.
     * Returns null if no matching question is found.
     * @param int $id the question ID to search for
     * @return array|null the question array or null if not found
     */
    public function getQuestion($id)
    {
        // loop through all questions
        foreach ($this->questions as $question) {
            // Check if question has an ID and matches the requested ID
            if (isset($question['id']) && $question['id'] == $id) {
                return $question;
            }
        }
        return null;
    }

    /**
     * Get total number of questions in the survey
     * @return int Count of questions
     */
    public function getTotalQuestions()
    {
        return count($this->questions);
    }

    /**
     * Get survey title and description
     * Returns an array containing:
     * Survey title
     * Survey description
     * Age group (if specified)
     *  Uses isset() checks to avoid undefined index errors if data
     *  is missing from loaded JSON.
     * @return array Survey information
     */
    public function getSurveyInfo()
    {
        // Use ternary operator to check if title exists, use default if not
        $title = isset($this->surveyData['title']) ? $this->surveyData['title'] : 'Investment Knowledge Survey';
        $description = isset($this->surveyData['description']) ? $this->surveyData['description'] : 'Assess your investment knowledge';
        // return complete survey information
        return [
            'title' => $title,
            'description' => $description,
            "ageGroup" => $this->ageGroup
        ];
    }

    /**
     * Get any error messages generated during initialization
     *  Errors can occur during:
     *  File not found
     *  File read failure
     *  JSON parsing errors
     *  No questions in data
     * @return string Error message or empty string if no errors
     */
    public function getError()
    {
        return $this->error;
    }
}