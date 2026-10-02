using EduManage.Application.Contracts;
using MediatR;

namespace EduManage.Application.Features.Challenges;

public sealed record GetTodaysChallengeQuery(string UserId) : IRequest<DailyChallengeOut>
{
    private static readonly (string Description, string Type, int Target, string Unit)[] Pool =
    [
        ("Do 10 push-ups", "reps", 10, "push-ups"),
        ("Do 20 squats", "reps", 20, "squats"),
        ("Hold a plank for 60 seconds", "duration", 60, "seconds"),
        ("Walk or run 1 km", "distance", 1, "km"),
        ("Do 15 jumping jacks", "reps", 15, "jumping jacks"),
        ("Do 10 burpees", "reps", 10, "burpees"),
        ("Hold a wall sit for 45 seconds", "duration", 45, "seconds"),
        ("Do 25 sit-ups", "reps", 25, "sit-ups"),
        ("Walk 5,000 steps", "distance", 5000, "steps"),
        ("Do 12 lunges per leg", "reps", 12, "lunges per leg"),
        ("Hold a deep stretch for 5 minutes", "flexibility", 5, "minutes"),
        ("Do 20 mountain climbers", "reps", 20, "mountain climbers"),
        ("Run up and down stairs 5 times", "reps", 5, "times"),
        ("Do 15 glute bridges", "reps", 15, "glute bridges"),
        ("Hold a side plank for 30 seconds each side", "duration", 30, "seconds"),
        ("Do 10 tricep dips", "reps", 10, "tricep dips"),
        ("Walk briskly for 10 minutes", "duration", 10, "minutes"),
        ("Do 30 calf raises", "reps", 30, "calf raises"),
        ("Do 10 slow deep breaths — mindful reset", "flexibility", 10, "breaths"),
        ("Do 8 pull-ups (or 15 inverted rows)", "reps", 8, "pull-ups"),
        ("Stretch your hip flexors for 2 minutes each side", "flexibility", 4, "minutes total"),
        ("Do 20 high knees", "reps", 20, "high knees"),
        ("Do 10 push-ups with a 3-second pause at the bottom", "reps", 10, "slow push-ups"),
        ("Do 15 lateral band walks each direction", "reps", 15, "steps"),
        ("Do a 2-minute cool-down walk after your next workout", "duration", 2, "minutes"),
        ("Do 20 bicycle crunches", "reps", 20, "reps"),
        ("Hold a downward dog for 90 seconds", "duration", 90, "seconds"),
        ("Do 5 slow push-up negatives", "reps", 5, "negatives"),
        ("March in place for 3 minutes", "duration", 3, "minutes"),
        ("Do 10 jump squats", "reps", 10, "jump squats"),
    ];

    internal sealed class Handler(IUserChallengeLogRepository logRepository)
        : IRequestHandler<GetTodaysChallengeQuery, DailyChallengeOut>
    {
        public async Task<DailyChallengeOut> Handle(GetTodaysChallengeQuery request, CancellationToken cancellationToken)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var dayOfYear = today.DayOfYear;
            var entry = Pool[dayOfYear % Pool.Length];
            var completed = await logRepository.ExistsAsync(request.UserId, today, cancellationToken);

            return new DailyChallengeOut(
                today.ToString("yyyy-MM-dd"),
                entry.Description,
                entry.Type,
                entry.Target,
                entry.Unit,
                completed);
        }
    }
}
