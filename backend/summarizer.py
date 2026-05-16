"""
summarizer.py - Simple Text Summarization
==========================================
This module generates meeting summaries using basic text processing.
NO machine learning or AI libraries are used.

How it works:
1. Split the text into sentences
2. Count how often each word appears (word frequency)
3. Score each sentence based on the important words it contains
4. Pick the top-scoring sentences as the summary
"""

import re
from collections import Counter


# Common words that don't carry meaning (we skip these)
STOP_WORDS = {
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
    'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from',
    'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
    'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
    'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just',
    'because', 'but', 'and', 'or', 'if', 'while', 'about', 'up', 'this',
    'that', 'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your',
    'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their',
    'what', 'which', 'who', 'whom', 'this', 'that', 'am', 'also', 'get',
    'got', 'let', 'make', 'made', 'going', 'go', 'went', 'come', 'came',
    'said', 'say', 'says', 'like', 'well', 'back', 'know', 'take', 'see',
    'think', 'good', 'give', 'new', 'one', 'two', 'way', 'look', 'much',
}


def split_into_sentences(text):
    """
    Split text into individual sentences.
    Uses punctuation marks (. ! ?) as separators.
    """
    # Split on period, exclamation mark, or question mark
    sentences = re.split(r'[.!?]+', text)
    # Clean up: remove extra whitespace and empty sentences
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences


def get_word_frequencies(text):
    """
    Count how often each meaningful word appears in the text.
    We ignore common words (stop words) and short words.
    """
    # Convert to lowercase and extract only words
    words = re.findall(r'[a-zA-Z]+', text.lower())

    # Filter out stop words and very short words
    meaningful_words = [
        word for word in words
        if word not in STOP_WORDS and len(word) > 2
    ]

    # Count word frequencies
    return Counter(meaningful_words)


def score_sentence(sentence, word_freq):
    """
    Calculate an importance score for a sentence.
    Sentences with more frequent important words get higher scores.
    """
    words = re.findall(r'[a-zA-Z]+', sentence.lower())
    if not words:
        return 0

    # Sum up the frequency scores of all meaningful words in the sentence
    score = sum(word_freq.get(word, 0) for word in words)

    # Normalize by sentence length to avoid favoring very long sentences
    return score / len(words)


def generate_summary(text, num_sentences=3):
    """
    Generate a summary of the given text.

    Steps:
    1. Split text into sentences
    2. Calculate word frequencies
    3. Score each sentence
    4. Return the top N sentences as the summary

    Args:
        text: The meeting transcript text
        num_sentences: How many sentences to include in summary (default: 3)

    Returns:
        A string containing the summary
    """
    # Handle empty or very short text
    if not text or len(text.strip()) < 10:
        return "Text is too short to summarize."

    # Step 1: Split into sentences
    sentences = split_into_sentences(text)

    # If text has fewer sentences than requested, return all of it
    if len(sentences) <= num_sentences:
        return text.strip()

    # Step 2: Get word frequencies
    word_freq = get_word_frequencies(text)

    # Step 3: Score each sentence
    scored_sentences = []
    for i, sentence in enumerate(sentences):
        score = score_sentence(sentence, word_freq)
        scored_sentences.append((i, sentence, score))

    # Step 4: Sort by score (highest first) and pick top sentences
    scored_sentences.sort(key=lambda x: x[2], reverse=True)
    top_sentences = scored_sentences[:num_sentences]

    # Sort selected sentences by their original order (for readability)
    top_sentences.sort(key=lambda x: x[0])

    # Join the top sentences into a summary
    summary = '. '.join(sentence for _, sentence, _ in top_sentences) + '.'

    return summary


def extract_keywords(text, num_keywords=5):
    """
    Extract the most important keywords from the text.
    Simply returns the most frequently used meaningful words.

    Args:
        text: The text to extract keywords from
        num_keywords: How many keywords to return (default: 5)

    Returns:
        A list of keyword strings
    """
    word_freq = get_word_frequencies(text)
    # Get the most common words
    top_keywords = word_freq.most_common(num_keywords)
    return [word for word, count in top_keywords]
